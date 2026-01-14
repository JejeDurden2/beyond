import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  BeneficiaryAccountCreatedEmailInput,
  BeneficiaryInvitationEmailInput,
  IEmailService,
  SendEmailInput,
  SupportedLocale,
  TrustedPersonAlertEmailInput,
  TrustedPersonInvitationEmailInput,
} from '../ports';

@Injectable()
export class ResendEmailAdapter implements IEmailService {
  private readonly logger = new Logger(ResendEmailAdapter.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') ?? 'Beyond <hello@beyond.app>';
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }

  async sendEmail(input: SendEmailInput): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${input.to}: ${error.message}`, error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      this.logger.log(`Email sent successfully to ${input.to}, id: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error sending email to ${input.to}`, error);
      throw error;
    }
  }

  async sendBeneficiaryInvitation(input: BeneficiaryInvitationEmailInput): Promise<void> {
    const accessUrl = `${this.frontendUrl}/${input.locale}/portal/access/${input.invitationToken}`;

    const keepsakeText =
      input.keepsakeCount === 1
        ? this.getLocalizedText(input.locale, { fr: 'un souvenir', en: 'a keepsake' })
        : this.getLocalizedText(input.locale, {
            fr: `${input.keepsakeCount} souvenirs`,
            en: `${input.keepsakeCount} keepsakes`,
          });

    const subject = this.getLocalizedText(input.locale, {
      fr: `${input.senderName} vous a laissé des souvenirs sur Beyond`,
      en: `${input.senderName} has left keepsakes for you on Beyond`,
    });

    const html = this.getLocalizedText(input.locale, {
      fr: this.buildFrenchInvitationEmail(
        input.beneficiaryName,
        input.senderName,
        keepsakeText,
        accessUrl,
      ),
      en: this.buildEnglishInvitationEmail(
        input.beneficiaryName,
        input.senderName,
        keepsakeText,
        accessUrl,
      ),
    });

    await this.sendEmail({ to: input.to, subject, html });
  }

  async sendBeneficiaryAccountCreated(input: BeneficiaryAccountCreatedEmailInput): Promise<void> {
    const portalUrl = `${this.frontendUrl}/${input.locale}/portal`;

    const subject = this.getLocalizedText(input.locale, {
      fr: 'Bienvenue sur Beyond - Votre compte a été créé',
      en: 'Welcome to Beyond - Your account has been created',
    });

    const html = this.getLocalizedText(input.locale, {
      fr: this.buildFrenchAccountCreatedEmail(input.beneficiaryName, portalUrl),
      en: this.buildEnglishAccountCreatedEmail(input.beneficiaryName, portalUrl),
    });

    await this.sendEmail({ to: input.to, subject, html });
  }

  async sendTrustedPersonAlert(input: TrustedPersonAlertEmailInput): Promise<void> {
    const accessUrl = `${this.frontendUrl}/${input.locale}/portal/access/${input.invitationToken}`;

    const keepsakeText =
      input.keepsakeCount === 1
        ? this.getLocalizedText(input.locale, { fr: 'un souvenir', en: 'a keepsake' })
        : this.getLocalizedText(input.locale, {
            fr: `${input.keepsakeCount} souvenirs`,
            en: `${input.keepsakeCount} keepsakes`,
          });

    const subject = this.getLocalizedText(input.locale, {
      fr: `${input.vaultOwnerName} vous a laissé des souvenirs sur Beyond`,
      en: `${input.vaultOwnerName} has left keepsakes for you on Beyond`,
    });

    const html = this.getLocalizedText(input.locale, {
      fr: this.buildFrenchTrustedPersonAlertEmail(
        input.trustedPersonName,
        input.vaultOwnerName,
        keepsakeText,
        accessUrl,
      ),
      en: this.buildEnglishTrustedPersonAlertEmail(
        input.trustedPersonName,
        input.vaultOwnerName,
        keepsakeText,
        accessUrl,
      ),
    });

    await this.sendEmail({ to: input.to, subject, html });
  }

  private getLocalizedText<T>(locale: SupportedLocale, texts: Record<SupportedLocale, T>): T {
    return texts[locale];
  }

  private buildFrenchInvitationEmail(
    beneficiaryName: string,
    senderName: string,
    keepsakeText: string,
    accessUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7;">
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #173C7F;">
    <h1 style="color: #B8860B; font-size: 28px; margin-bottom: 24px;">${senderName} vous a laissé des souvenirs</h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Bonjour ${beneficiaryName},</p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
      <strong>${senderName}</strong> vous a confié ${keepsakeText} sur Beyond,
      une plateforme sécurisée pour préserver et partager les souvenirs importants.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
      Pour découvrir ces souvenirs, cliquez sur le bouton ci-dessous :
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${accessUrl}"
         style="background-color: #B8860B; color: #FDFBF7; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
        Voir mes souvenirs
      </a>
    </div>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin-top: 32px;">
      Ce lien est valable pendant 30 jours.
    </p>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6;">
      Si vous n'arrivez pas à cliquer sur le bouton, copiez ce lien dans votre navigateur :<br>
      <span style="word-break: break-all;">${accessUrl}</span>
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

  private buildEnglishInvitationEmail(
    beneficiaryName: string,
    senderName: string,
    keepsakeText: string,
    accessUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7;">
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #173C7F;">
    <h1 style="color: #B8860B; font-size: 28px; margin-bottom: 24px;">${senderName} has left keepsakes for you</h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hello ${beneficiaryName},</p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
      <strong>${senderName}</strong> has entrusted you with ${keepsakeText} on Beyond,
      a secure platform for preserving and sharing important memories.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
      To discover these keepsakes, click the button below:
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${accessUrl}"
         style="background-color: #B8860B; color: #FDFBF7; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
        View my keepsakes
      </a>
    </div>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin-top: 32px;">
      This link is valid for 30 days.
    </p>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6;">
      If you can't click the button, copy this link into your browser:<br>
      <span style="word-break: break-all;">${accessUrl}</span>
    </p>
    <hr style="border: none; border-top: 1px solid #E8E4DC; margin: 32px 0;" />
    <p style="font-size: 12px; color: #64748B; text-align: center;">
      Beyond - Preserve your memories for future generations
    </p>
  </div>
</body>
</html>
    `.trim();
  }

  private buildFrenchAccountCreatedEmail(beneficiaryName: string, portalUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7;">
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #173C7F;">
    <h1 style="color: #B8860B; font-size: 28px; margin-bottom: 24px;">Bienvenue sur Beyond</h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Bonjour ${beneficiaryName},</p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
      Votre compte Beyond a été créé avec succès. Vous pouvez maintenant accéder à votre portail
      personnel pour découvrir les souvenirs qui vous ont été confiés.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${portalUrl}"
         style="background-color: #B8860B; color: #FDFBF7; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
        Accéder à mon portail
      </a>
    </div>
    <hr style="border: none; border-top: 1px solid #E8E4DC; margin: 32px 0;" />
    <p style="font-size: 12px; color: #64748B; text-align: center;">
      Beyond - Préservez vos souvenirs pour les générations futures
    </p>
  </div>
</body>
</html>
    `.trim();
  }

  private buildEnglishAccountCreatedEmail(beneficiaryName: string, portalUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7;">
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #173C7F;">
    <h1 style="color: #B8860B; font-size: 28px; margin-bottom: 24px;">Welcome to Beyond</h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hello ${beneficiaryName},</p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
      Your Beyond account has been successfully created. You can now access your personal portal
      to discover the keepsakes that have been entrusted to you.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${portalUrl}"
         style="background-color: #B8860B; color: #FDFBF7; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
        Access my portal
      </a>
    </div>
    <hr style="border: none; border-top: 1px solid #E8E4DC; margin: 32px 0;" />
    <p style="font-size: 12px; color: #64748B; text-align: center;">
      Beyond - Preserve your memories for future generations
    </p>
  </div>
</body>
</html>
    `.trim();
  }

  private buildFrenchTrustedPersonAlertEmail(
    trustedPersonName: string,
    vaultOwnerName: string,
    keepsakeText: string,
    accessUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7;">
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #173C7F;">
    <h1 style="color: #B8860B; font-size: 28px; margin-bottom: 24px;">${vaultOwnerName} vous a laissé des souvenirs</h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Bonjour ${trustedPersonName},</p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
      En tant que personne de confiance désignée par <strong>${vaultOwnerName}</strong>,
      vous avez ${keepsakeText} qui vous attendent sur Beyond.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
      <strong>En tant que personne de confiance, vous avez également des responsabilités :</strong>
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #173C7F; margin-bottom: 24px;">
      <li>Gérer la transmission des souvenirs aux autres bénéficiaires</li>
      <li>Vous connecter pour accéder à votre tableau de bord</li>
    </ul>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${accessUrl}"
         style="background-color: #B8860B; color: #FDFBF7; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
        Créer mon compte
      </a>
    </div>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin-top: 32px;">
      Ce lien est valable pendant 30 jours.
    </p>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6;">
      Si vous n'arrivez pas à cliquer sur le bouton, copiez ce lien dans votre navigateur :<br>
      <span style="word-break: break-all;">${accessUrl}</span>
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

  private buildEnglishTrustedPersonAlertEmail(
    trustedPersonName: string,
    vaultOwnerName: string,
    keepsakeText: string,
    accessUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7;">
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #173C7F;">
    <h1 style="color: #B8860B; font-size: 28px; margin-bottom: 24px;">${vaultOwnerName} has left keepsakes for you</h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hello ${trustedPersonName},</p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
      As the trusted person designated by <strong>${vaultOwnerName}</strong>,
      you have ${keepsakeText} waiting for you on Beyond.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
      <strong>As a trusted person, you also have responsibilities:</strong>
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #173C7F; margin-bottom: 24px;">
      <li>Manage the transmission of keepsakes to other beneficiaries</li>
      <li>Log in to access your dashboard</li>
    </ul>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${accessUrl}"
         style="background-color: #B8860B; color: #FDFBF7; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
        Create my account
      </a>
    </div>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin-top: 32px;">
      This link is valid for 30 days.
    </p>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6;">
      If you can't click the button, copy this link into your browser:<br>
      <span style="word-break: break-all;">${accessUrl}</span>
    </p>
    <hr style="border: none; border-top: 1px solid #E8E4DC; margin: 32px 0;" />
    <p style="font-size: 12px; color: #64748B; text-align: center;">
      Beyond - Preserve your memories for future generations
    </p>
  </div>
</body>
</html>
    `.trim();
  }

  async sendTrustedPersonInvitation(input: TrustedPersonInvitationEmailInput): Promise<void> {
    const invitationUrl = `${this.frontendUrl}/${input.locale}/portal/access/${input.invitationToken}`;

    const subject = this.getLocalizedText(input.locale, {
      fr: `${input.vaultOwnerName} vous a désigné comme personne de confiance sur Beyond`,
      en: `${input.vaultOwnerName} has designated you as their trusted person on Beyond`,
    });

    const html = this.getLocalizedText(input.locale, {
      fr: this.buildFrenchTrustedPersonInvitationEmail(
        input.trustedPersonName,
        input.vaultOwnerName,
        invitationUrl,
      ),
      en: this.buildEnglishTrustedPersonInvitationEmail(
        input.trustedPersonName,
        input.vaultOwnerName,
        invitationUrl,
      ),
    });

    await this.sendEmail({ to: input.to, subject, html });
  }

  private buildFrenchTrustedPersonInvitationEmail(
    trustedPersonName: string,
    vaultOwnerName: string,
    invitationUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7;">
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #173C7F;">
    <h1 style="color: #B8860B; font-size: 28px; margin-bottom: 24px;">Vous êtes désigné(e) comme personne de confiance</h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Bonjour ${trustedPersonName},</p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
      <strong>${vaultOwnerName}</strong> vous a désigné(e) comme sa personne de confiance sur Beyond,
      une plateforme sécurisée pour préserver et transmettre les souvenirs importants.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
      <strong>Ce que cela signifie :</strong>
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #173C7F; margin-bottom: 24px;">
      <li>Vous pourrez déclarer le décès de ${vaultOwnerName} le moment venu</li>
      <li>Vous aiderez à transmettre ses souvenirs aux bénéficiaires qu'il/elle a choisis</li>
      <li>C'est un rôle de confiance important</li>
    </ul>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
      Pour accepter ce rôle et créer votre compte, cliquez sur le bouton ci-dessous :
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${invitationUrl}"
         style="background-color: #B8860B; color: #FDFBF7; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
        Créer mon compte
      </a>
    </div>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin-top: 32px;">
      Ce lien est valable pendant 30 jours.
    </p>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6;">
      Si vous n'arrivez pas à cliquer sur le bouton, copiez ce lien dans votre navigateur :<br>
      <span style="word-break: break-all;">${invitationUrl}</span>
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

  private buildEnglishTrustedPersonInvitationEmail(
    trustedPersonName: string,
    vaultOwnerName: string,
    invitationUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7;">
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #173C7F;">
    <h1 style="color: #B8860B; font-size: 28px; margin-bottom: 24px;">You've been designated as a trusted person</h1>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hello ${trustedPersonName},</p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
      <strong>${vaultOwnerName}</strong> has designated you as their trusted person on Beyond,
      a secure platform for preserving and passing on important memories.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
      <strong>What this means:</strong>
    </p>
    <ul style="font-size: 16px; line-height: 1.8; color: #173C7F; margin-bottom: 24px;">
      <li>You will be able to declare ${vaultOwnerName}'s passing when the time comes</li>
      <li>You will help transmit their keepsakes to the beneficiaries they've chosen</li>
      <li>This is an important role of trust</li>
    </ul>
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
      To accept this role and create your account, click the button below:
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${invitationUrl}"
         style="background-color: #B8860B; color: #FDFBF7; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
        Create my account
      </a>
    </div>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6; margin-top: 32px;">
      This link is valid for 30 days.
    </p>
    <p style="font-size: 14px; color: #64748B; line-height: 1.6;">
      If you can't click the button, copy this link into your browser:<br>
      <span style="word-break: break-all;">${invitationUrl}</span>
    </p>
    <hr style="border: none; border-top: 1px solid #E8E4DC; margin: 32px 0;" />
    <p style="font-size: 12px; color: #64748B; text-align: center;">
      Beyond - Preserve your memories for future generations
    </p>
  </div>
</body>
</html>
    `.trim();
  }
}
