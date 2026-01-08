export interface PasswordResetEmailData {
  to: string;
  resetUrl: string;
  expiresAt: Date;
}

export interface EmailVerificationData {
  to: string;
  verificationUrl: string;
  expiresAt: Date;
}

export interface EmailService {
  sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void>;
  sendEmailVerification(data: EmailVerificationData): Promise<void>;
}

export const EMAIL_SERVICE = Symbol('EmailService');
