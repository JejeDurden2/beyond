import { PasswordResetToken } from '../entities/password-reset-token.entity';

export interface PasswordResetTokenRepository {
  findByToken(token: string): Promise<PasswordResetToken | null>;
  findLatestByUserId(userId: string): Promise<PasswordResetToken | null>;
  save(token: PasswordResetToken): Promise<void>;
  invalidateAllForUser(userId: string): Promise<void>;
}

export const PASSWORD_RESET_TOKEN_REPOSITORY = Symbol('PasswordResetTokenRepository');
