import { AggregateRoot } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';
import { Email } from '../value-objects/email.value-object';
import { Password } from '../value-objects/password.value-object';
import { randomBytes } from 'crypto';

export enum UserRole {
  VAULT_OWNER = 'VAULT_OWNER',
  BENEFICIARY = 'BENEFICIARY',
  BOTH = 'BOTH',
}

export interface UserProps {
  id?: string;
  email: Email;
  password: Password;
  role: UserRole;

  // Profile fields
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;

  // Onboarding
  onboardingCompletedAt?: Date | null;

  // Security
  emailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationTokenExpiry?: Date | null;
  totpSecret?: string | null;

  // GDPR consent tracking
  termsAcceptedAt?: Date | null;
  privacyPolicyAcceptedAt?: Date | null;
  termsVersion?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role?: UserRole;
  acceptTerms?: boolean;
  termsVersion?: string;
}

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps) {
    super(props);
  }

  private static readonly TOKEN_EXPIRY_HOURS = 24;

  static async create(input: CreateUserInput): Promise<Result<User, string>> {
    const emailResult = Email.create(input.email);
    if (emailResult.isErr()) {
      return err(emailResult.error);
    }

    const passwordResult = await Password.create(input.password);
    if (passwordResult.isErr()) {
      return err(passwordResult.error);
    }

    const emailVerificationToken = randomBytes(32).toString('hex');
    const emailVerificationTokenExpiry = new Date(
      Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    // Record GDPR consent if provided
    const now = new Date();
    const termsAcceptedAt = input.acceptTerms ? now : null;
    const privacyPolicyAcceptedAt = input.acceptTerms ? now : null;
    const termsVersion = input.acceptTerms ? (input.termsVersion ?? '1.0') : null;

    return ok(
      new User({
        email: emailResult.value,
        password: passwordResult.value,
        role: input.role ?? UserRole.VAULT_OWNER,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationTokenExpiry,
        termsAcceptedAt,
        privacyPolicyAcceptedAt,
        termsVersion,
      }),
    );
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): Password {
    return this.props.password;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get emailVerificationToken(): string | null {
    return this.props.emailVerificationToken ?? null;
  }

  get emailVerificationTokenExpiry(): Date | null {
    return this.props.emailVerificationTokenExpiry ?? null;
  }

  get totpSecret(): string | null {
    return this.props.totpSecret ?? null;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt ?? null;
  }

  get firstName(): string | null {
    return this.props.firstName ?? null;
  }

  get lastName(): string | null {
    return this.props.lastName ?? null;
  }

  get avatarUrl(): string | null {
    return this.props.avatarUrl ?? null;
  }

  get onboardingCompletedAt(): Date | null {
    return this.props.onboardingCompletedAt ?? null;
  }

  get termsAcceptedAt(): Date | null {
    return this.props.termsAcceptedAt ?? null;
  }

  get privacyPolicyAcceptedAt(): Date | null {
    return this.props.privacyPolicyAcceptedAt ?? null;
  }

  get termsVersion(): string | null {
    return this.props.termsVersion ?? null;
  }

  async verifyPassword(plainPassword: string): Promise<boolean> {
    return this.props.password.compare(plainPassword);
  }

  verifyEmail(token: string): Result<void, string> {
    if (this.props.emailVerified) {
      return err('Email is already verified');
    }

    if (this.props.emailVerificationToken !== token) {
      return err('Invalid verification token');
    }

    if (
      this.props.emailVerificationTokenExpiry &&
      new Date() > this.props.emailVerificationTokenExpiry
    ) {
      return err('Verification token has expired');
    }

    this.props.emailVerified = true;
    this.props.emailVerificationToken = null;
    this.props.emailVerificationTokenExpiry = null;
    this._updatedAt = new Date();

    return ok(undefined);
  }

  setTotpSecret(secret: string): void {
    this.props.totpSecret = secret;
    this._updatedAt = new Date();
  }

  removeTotpSecret(): void {
    this.props.totpSecret = null;
    this._updatedAt = new Date();
  }

  softDelete(): void {
    this.props.deletedAt = new Date();
    this._updatedAt = new Date();
  }

  updateProfile(data: { firstName?: string; lastName?: string }): void {
    if (data.firstName !== undefined) {
      this.props.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
      this.props.lastName = data.lastName;
    }
    this._updatedAt = new Date();
  }

  setAvatarUrl(url: string | null): void {
    this.props.avatarUrl = url;
    this._updatedAt = new Date();
  }

  completeOnboarding(): void {
    this.props.onboardingCompletedAt = new Date();
    this._updatedAt = new Date();
  }

  async updatePassword(newPassword: Password): Promise<void> {
    this.props.password = newPassword;
    this._updatedAt = new Date();
  }

  get role(): UserRole {
    return this.props.role;
  }

  isVaultOwner(): boolean {
    return this.props.role === UserRole.VAULT_OWNER || this.props.role === UserRole.BOTH;
  }

  isBeneficiary(): boolean {
    return this.props.role === UserRole.BENEFICIARY || this.props.role === UserRole.BOTH;
  }

  upgradeToVaultOwner(): Result<void, string> {
    if (this.props.role === UserRole.VAULT_OWNER) {
      return err('User is already a vault owner');
    }

    if (this.props.role === UserRole.BOTH) {
      return err('User already has both roles');
    }

    this.props.role = UserRole.BOTH;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  linkBeneficiaryProfile(): Result<void, string> {
    if (this.props.role === UserRole.BENEFICIARY || this.props.role === UserRole.BOTH) {
      return ok(undefined); // Already has beneficiary role
    }

    this.props.role = UserRole.BOTH;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Record GDPR consent acceptance
   */
  acceptTerms(version: string): void {
    const now = new Date();
    this.props.termsAcceptedAt = now;
    this.props.privacyPolicyAcceptedAt = now;
    this.props.termsVersion = version;
    this._updatedAt = new Date();
  }

  /**
   * Check if user has accepted the current terms version
   */
  hasAcceptedTerms(currentVersion: string): boolean {
    return this.props.termsAcceptedAt !== null && this.props.termsVersion === currentVersion;
  }
}
