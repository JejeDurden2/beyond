import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  EmailService,
  PasswordResetEmailData,
  EmailVerificationData,
} from '../../domain/ports/email.service';

@Injectable()
export class ResendEmailService implements EmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') ?? 'Beyond <hello@beyond.app>';
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    const html = this.buildPasswordResetEmail(data.resetUrl, data.expiresAt);

    try {
      const { data: result, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: data.to,
        subject: 'Beyond - Réinitialisation de votre mot de passe',
        html,
      });

      if (error) {
        this.logger.error(`Failed to send password reset email to ${data.to}: ${error.message}`);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      this.logger.log(`Password reset email sent to ${data.to}, id: ${result?.id}`);
    } catch (error) {
      this.logger.error(`Error sending password reset email to ${data.to}`, error);
      throw error;
    }
  }

  async sendEmailVerification(data: EmailVerificationData): Promise<void> {
    const html = this.buildEmailVerificationEmail(data.verificationUrl, data.expiresAt);

    try {
      const { data: result, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: data.to,
        subject: 'Beyond - Vérifiez votre adresse email',
        html,
      });

      if (error) {
        this.logger.error(`Failed to send verification email to ${data.to}: ${error.message}`);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      this.logger.log(`Verification email sent to ${data.to}, id: ${result?.id}`);
    } catch (error) {
      this.logger.error(`Error sending verification email to ${data.to}`, error);
      throw error;
    }
  }

  private buildPasswordResetEmail(resetUrl: string, expiresAt: Date): string {
    const expiresInMinutes = Math.round((expiresAt.getTime() - Date.now()) / 60000);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7;">
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #173C7F;">
    <h1 style="color: #B8860B; font-size: 28px; margin-bottom: 24px;">Réinitialisation de votre mot de passe</h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Bonjour,</p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
      Vous avez demandé à réinitialiser votre mot de passe Beyond.
      Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}"
         style="background-color: #B8860B; color: #FDFBF7; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
        Réinitialiser mon mot de passe
      </a>
    </div>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin-top: 32px;">
      Ce lien expire dans ${expiresInMinutes} minutes.
    </p>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6;">
      Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
    </p>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6;">
      Si vous n'arrivez pas à cliquer sur le bouton, copiez ce lien dans votre navigateur :<br>
      <span style="word-break: break-all;">${resetUrl}</span>
    </p>
    <hr style="border: none; border-top: 1px solid #E8E4DC; margin: 32px 0;" />
    <p style="font-size: 12px; color: #64748B; text-align: center;">
      Beyond - Préservez vos souvenirs pour les générations futures
    </p>
  </div>
</body>
</html>
    `.trim();
  }

  private buildEmailVerificationEmail(verificationUrl: string, expiresAt: Date): string {
    const expiresInHours = Math.round((expiresAt.getTime() - Date.now()) / 3600000);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7;">
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #173C7F;">
    <h1 style="color: #B8860B; font-size: 28px; margin-bottom: 24px;">Vérifiez votre adresse email</h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Bonjour,</p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
      Merci de vous être inscrit sur Beyond. Pour finaliser la création de votre compte,
      veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verificationUrl}"
         style="background-color: #B8860B; color: #FDFBF7; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
        Vérifier mon email
      </a>
    </div>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin-top: 32px;">
      Ce lien expire dans ${expiresInHours} heures.
    </p>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6;">
      Si vous n'avez pas créé de compte Beyond, vous pouvez ignorer cet email.
    </p>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6;">
      Si vous n'arrivez pas à cliquer sur le bouton, copiez ce lien dans votre navigateur :<br>
      <span style="word-break: break-all;">${verificationUrl}</span>
    </p>
    <hr style="border: none; border-top: 1px solid #E8E4DC; margin: 32px 0;" />
    <p style="font-size: 12px; color: #64748B; text-align: center;">
      Beyond - Préservez vos souvenirs pour les générations futures
    </p>
  </div>
</body>
</html>
    `.trim();
  }
}
