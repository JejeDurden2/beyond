import { AggregateRoot } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';
import { Email } from '../value-objects/email.value-object';
import { Password } from '../value-objects/password.value-object';
import { randomBytes } from 'crypto';

export interface UserProps {
  id?: string;
  email: Email;
  password: Password;

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

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
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

    return ok(
      new User({
        email: emailResult.value,
        password: passwordResult.value,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationTokenExpiry,
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
}
