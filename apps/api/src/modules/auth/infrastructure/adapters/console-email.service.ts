import { Injectable, Logger } from '@nestjs/common';
import {
  EmailService,
  PasswordResetEmailData,
  EmailVerificationData,
} from '../../domain/ports/email.service';

/**
 * Console-based email service for development.
 * Replace this with a real email provider (SendGrid, Resend, AWS SES, etc.)
 * by implementing the EmailService interface.
 */
@Injectable()
export class ConsoleEmailService implements EmailService {
  private readonly logger = new Logger(ConsoleEmailService.name);

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    this.logger.log('========================================');
    this.logger.log('PASSWORD RESET EMAIL (Development Mode)');
    this.logger.log('========================================');
    this.logger.log(`To: ${data.to}`);
    this.logger.log(`Reset URL: ${data.resetUrl}`);
    this.logger.log(`Expires at: ${data.expiresAt.toISOString()}`);
    this.logger.log('========================================');
    this.logger.warn(
      'Email service is using console output. Configure a real email provider for production.',
    );
  }

  async sendEmailVerification(data: EmailVerificationData): Promise<void> {
    this.logger.log('========================================');
    this.logger.log('EMAIL VERIFICATION (Development Mode)');
    this.logger.log('========================================');
    this.logger.log(`To: ${data.to}`);
    this.logger.log(`Verification URL: ${data.verificationUrl}`);
    this.logger.log(`Expires at: ${data.expiresAt.toISOString()}`);
    this.logger.log('========================================');
    this.logger.warn(
      'Email service is using console output. Configure a real email provider for production.',
    );
  }
}
