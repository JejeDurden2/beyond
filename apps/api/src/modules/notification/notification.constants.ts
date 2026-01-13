/**
 * Default delay (in hours) for trusted person notifications after keepsake delivery.
 * Trusted persons receive notifications first so they can manage the process.
 */
export const DEFAULT_TRUSTED_PERSON_DELAY_HOURS = 72;

/**
 * Default delay (in hours) for regular beneficiary notifications after keepsake delivery.
 * Beneficiaries receive notifications after trusted persons have had time to manage.
 */
export const DEFAULT_BENEFICIARY_DELAY_HOURS = 168;

/**
 * Default locale for email notifications.
 * TODO: Replace with user/beneficiary preference when locale field is added to User entity.
 */
export const DEFAULT_EMAIL_LOCALE = 'fr' as const;

export type SupportedLocale = 'fr' | 'en';
