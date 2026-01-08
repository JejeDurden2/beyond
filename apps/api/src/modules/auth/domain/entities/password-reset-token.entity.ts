import { Entity } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';
import { randomBytes } from 'crypto';

export interface PasswordResetTokenProps {
  id?: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt?: Date;
}

export class PasswordResetToken extends Entity<PasswordResetTokenProps> {
  private static readonly TOKEN_EXPIRY_HOURS = 1;

  private constructor(props: PasswordResetTokenProps) {
    super(props);
  }

  static create(userId: string): Result<PasswordResetToken, string> {
    if (!userId) {
      return err('User ID is required');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    return ok(
      new PasswordResetToken({
        userId,
        token,
        expiresAt,
        usedAt: null,
      }),
    );
  }

  static reconstitute(props: PasswordResetTokenProps): PasswordResetToken {
    return new PasswordResetToken(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get token(): string {
    return this.props.token;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get usedAt(): Date | null {
    return this.props.usedAt ?? null;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  isUsed(): boolean {
    return this.props.usedAt !== null && this.props.usedAt !== undefined;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isUsed();
  }

  markAsUsed(): Result<void, string> {
    if (this.isUsed()) {
      return err('Token has already been used');
    }

    if (this.isExpired()) {
      return err('Token has expired');
    }

    this.props.usedAt = new Date();
    return ok(undefined);
  }
}
