export type SupportedLocale = 'fr' | 'en';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface BeneficiaryInvitationEmailInput {
  to: string;
  beneficiaryName: string;
  senderName: string;
  invitationToken: string;
  locale: SupportedLocale;
}

export interface BeneficiaryAccountCreatedEmailInput {
  to: string;
  beneficiaryName: string;
  locale: SupportedLocale;
}

export interface TrustedPersonAlertEmailInput {
  to: string;
  vaultOwnerName: string;
  locale: SupportedLocale;
}

export interface IEmailService {
  sendEmail(input: SendEmailInput): Promise<void>;
  sendBeneficiaryInvitation(input: BeneficiaryInvitationEmailInput): Promise<void>;
  sendBeneficiaryAccountCreated(input: BeneficiaryAccountCreatedEmailInput): Promise<void>;
  sendTrustedPersonAlert(input: TrustedPersonAlertEmailInput): Promise<void>;
}

export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');
