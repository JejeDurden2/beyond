import { AggregateRoot } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';
import { randomBytes } from 'crypto';

export interface BeneficiaryAccessTokenProps {
  id?: string;
  beneficiaryId: string;
  token: string;
  expiresAt: Date;
  lastAccessedAt?: Date | null;
  createdAt?: Date;
}

export interface CreateBeneficiaryAccessTokenInput {
  beneficiaryId: string;
  expiresInDays?: number;
}

export class BeneficiaryAccessToken extends AggregateRoot<BeneficiaryAccessTokenProps> {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly DEFAULT_EXPIRY_DAYS = 7;

  private constructor(props: BeneficiaryAccessTokenProps) {
    super(props);
  }

  static create(input: CreateBeneficiaryAccessTokenInput): Result<BeneficiaryAccessToken, string> {
    if (!input.beneficiaryId) {
      return err('Beneficiary ID is required');
    }

    const token = this.generateToken();
    const expiryDays = input.expiresInDays ?? this.DEFAULT_EXPIRY_DAYS;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    return ok(
      new BeneficiaryAccessToken({
        beneficiaryId: input.beneficiaryId,
        token,
        expiresAt,
        lastAccessedAt: null,
      }),
    );
  }

  static reconstitute(props: BeneficiaryAccessTokenProps): BeneficiaryAccessToken {
    return new BeneficiaryAccessToken(props);
  }

  private static generateToken(): string {
    return randomBytes(this.TOKEN_LENGTH).toString('base64url');
  }

  recordAccess(): void {
    this.props.lastAccessedAt = new Date();
    this._updatedAt = new Date();
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  isValid(): boolean {
    return !this.isExpired();
  }

  get beneficiaryId(): string {
    return this.props.beneficiaryId;
  }

  get token(): string {
    return this.props.token;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get lastAccessedAt(): Date | null {
    return this.props.lastAccessedAt ?? null;
  }
}
