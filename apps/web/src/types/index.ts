export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  onboardingCompletedAt: string | null;
  emailVerified: boolean;
  hasTotpEnabled: boolean;
  createdAt: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface AvatarUploadResponse {
  uploadUrl: string;
  key: string;
  expiresAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Vault {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type KeepsakeType = 'document' | 'letter' | 'photo' | 'video' | 'wish' | 'scheduled_action';
export type KeepsakeStatus = 'draft' | 'scheduled' | 'delivered';
export type TriggerCondition = 'on_death' | 'on_date' | 'manual';
export type MediaType = 'image' | 'video' | 'document';

export interface KeepsakeMedia {
  id: string;
  keepsakeId: string;
  type: MediaType;
  key: string;
  filename: string;
  mimeType: string;
  size: number;
  order: number;
  url?: string;
  urlExpiresAt?: string;
  createdAt: string;
}

export interface Keepsake {
  id: string;
  type: KeepsakeType;
  title: string;
  content?: string;
  status: KeepsakeStatus;
  triggerCondition: TriggerCondition;
  revealDelay: number | null;
  revealDate: string | null;
  scheduledAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KeepsakeSummary {
  id: string;
  type: KeepsakeType;
  title: string;
  status: KeepsakeStatus;
  triggerCondition: TriggerCondition;
  revealDelay: number | null;
  revealDate: string | null;
  scheduledAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKeepsakeInput {
  type: KeepsakeType;
  title: string;
  content: string;
  triggerCondition?: TriggerCondition;
  revealDelay?: number;
  revealDate?: string;
  scheduledAt?: string;
}

export interface UpdateKeepsakeInput {
  title?: string;
  content?: string;
  triggerCondition?: TriggerCondition;
  revealDelay?: number | null;
  revealDate?: string | null;
  scheduledAt?: string | null;
}

export interface UploadUrlRequest {
  filename: string;
  mimeType: string;
}

export interface UploadUrlResponse {
  url: string;
  key: string;
  expiresAt: string;
}

export interface ConfirmMediaUploadRequest {
  media: Array<{
    key: string;
    filename: string;
    mimeType: string;
    size: number;
    order?: number;
  }>;
}

export interface GetMediaResponse {
  media: KeepsakeMedia[];
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export function getAllowedMimeTypes(): string[] {
  return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES];
}

export function getMediaTypeFromMime(mimeType: string): MediaType | null {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video';
  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) return 'document';
  return null;
}

export function getMaxFileSize(mediaType: MediaType): number {
  switch (mediaType) {
    case 'image':
      return MAX_IMAGE_SIZE;
    case 'video':
      return MAX_VIDEO_SIZE;
    case 'document':
      return MAX_DOCUMENT_SIZE;
  }
}

// Beneficiaries
export type Relationship =
  | 'SPOUSE'
  | 'CHILD'
  | 'PARENT'
  | 'SIBLING'
  | 'GRANDCHILD'
  | 'GRANDPARENT'
  | 'FRIEND'
  | 'COLLEAGUE'
  | 'OTHER';

export const RELATIONSHIPS: Relationship[] = [
  'SPOUSE',
  'CHILD',
  'PARENT',
  'SIBLING',
  'GRANDCHILD',
  'GRANDPARENT',
  'FRIEND',
  'COLLEAGUE',
  'OTHER',
];

export interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  relationship: Relationship;
  note: string | null;
  isTrustedPerson: boolean;
  assignmentCount: number;
  createdAt: string;
}

export interface CreateBeneficiaryInput {
  firstName: string;
  lastName: string;
  email: string;
  relationship: Relationship;
  note?: string;
}

export interface UpdateBeneficiaryInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  relationship?: Relationship;
  note?: string | null;
}

// Keepsake Assignments
export interface KeepsakeAssignment {
  id: string;
  keepsakeId: string;
  beneficiaryId: string;
  beneficiaryFirstName: string;
  beneficiaryLastName: string;
  beneficiaryFullName: string;
  beneficiaryEmail: string;
  beneficiaryRelationship: Relationship;
  personalMessage: string | null;
  createdAt: string;
}

export interface BeneficiaryKeepsake {
  id: string;
  keepsakeId: string;
  keepsakeTitle: string;
  keepsakeType: KeepsakeType;
  keepsakeStatus: KeepsakeStatus;
  keepsakeUpdatedAt: string;
  personalMessage: string | null;
  createdAt: string;
}
