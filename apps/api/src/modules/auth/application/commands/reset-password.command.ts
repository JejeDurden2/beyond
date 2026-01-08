import { Injectable, Inject, Logger } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import { UserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';
import {
  PasswordResetTokenRepository,
  PASSWORD_RESET_TOKEN_REPOSITORY,
} from '../../domain/repositories/password-reset-token.repository';
import { Password } from '../../domain/value-objects/password.value-object';

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

@Injectable()
export class ResetPasswordCommand {
  private readonly logger = new Logger(ResetPasswordCommand.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
  ) {}

  async execute(input: ResetPasswordInput): Promise<Result<void, string>> {
    // Find the reset token
    const resetToken = await this.passwordResetTokenRepository.findByToken(input.token);

    if (!resetToken) {
      this.logger.debug('Invalid reset token provided');
      return err('Invalid or expired reset link');
    }

    if (!resetToken.isValid()) {
      this.logger.debug(
        `Reset token is invalid: expired=${resetToken.isExpired()}, used=${resetToken.isUsed()}`,
      );
      return err('Invalid or expired reset link');
    }

    // Find the user
    const user = await this.userRepository.findById(resetToken.userId);
    if (!user) {
      this.logger.error(`User not found for reset token: ${resetToken.userId}`);
      return err('Invalid or expired reset link');
    }

    // Validate and hash the new password
    const passwordResult = await Password.create(input.newPassword);
    if (passwordResult.isErr()) {
      return err(passwordResult.error);
    }

    // Update user password
    await user.updatePassword(passwordResult.value);
    await this.userRepository.save(user);

    // Mark token as used
    const markUsedResult = resetToken.markAsUsed();
    if (markUsedResult.isErr()) {
      this.logger.warn(`Failed to mark token as used: ${markUsedResult.error}`);
    }
    await this.passwordResetTokenRepository.save(resetToken);

    // Invalidate all other tokens for this user
    await this.passwordResetTokenRepository.invalidateAllForUser(user.id);

    this.logger.log(`Password reset completed for user ${user.id}`);
    return ok(undefined);
  }
}
