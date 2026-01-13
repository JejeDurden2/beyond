export const NOTIFICATION_QUEUE = 'notification';

export enum NotificationJobType {
  SEND_EMAIL = 'send_email',
  SEND_TRUSTED_PERSON_ALERT = 'send_trusted_person_alert',
  SEND_BENEFICIARY_INVITATION = 'send_beneficiary_invitation',
}
