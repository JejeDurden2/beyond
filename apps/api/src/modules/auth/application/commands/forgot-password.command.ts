import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result, ok, err } from 'neverthrow';
import { UserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';
import {
  PasswordResetTokenRepository,
  PASSWORD_RESET_TOKEN_REPOSITORY,
} from '../../domain/repositories/password-reset-token.repository';
import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';
import { EmailService, EMAIL_SERVICE } from '../../domain/ports/email.service';
import { Email } from '../../domain/value-objects/email.value-object';

export interface ForgotPasswordInput {
  email: string;
}

@Injectable()
export class ForgotPasswordCommand {
  private readonly logger = new Logger(ForgotPasswordCommand.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: ForgotPasswordInput): Promise<Result<void, string>> {
    const emailResult = Email.create(input.email);
    if (emailResult.isErr()) {
      // Don't reveal if email format is invalid - security best practice
      this.logger.debug(`Invalid email format: ${input.email}`);
      return ok(undefined);
    }

    const user = await this.userRepository.findByEmail(emailResult.value);

    // Always return success to prevent email enumeration attacks
    if (!user) {
      this.logger.debug(`No user found for email: ${input.email}`);
      return ok(undefined);
    }

    // Invalidate any existing tokens for this user
    await this.passwordResetTokenRepository.invalidateAllForUser(user.id);

    // Create new reset token
    const tokenResult = PasswordResetToken.create(user.id);
    if (tokenResult.isErr()) {
      this.logger.error(`Failed to create reset token: ${tokenResult.error}`);
      return err(tokenResult.error);
    }

    const resetToken = tokenResult.value;
    await this.passwordResetTokenRepository.save(resetToken);

    // Build reset URL
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken.token}`;

    // Send email (will be logged in development mode)
    try {
      await this.emailService.sendPasswordResetEmail({
        to: user.email.value,
        resetUrl,
        expiresAt: resetToken.expiresAt,
      });
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error}`);
      // Don't fail the request if email sending fails
    }

    this.logger.log(`Password reset requested for user ${user.id}`);
    return ok(undefined);
  }
}
