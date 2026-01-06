export type KeepsakeType =
  | 'text'
  | 'letter'
  | 'photo'
  | 'video'
  | 'wish'
  | 'scheduled_action';

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
  vaultId: string;
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

export interface KeepsakeWithMedia extends Keepsake {
  media: KeepsakeMedia[];
}

export interface CreateKeepsakeRequest {
  type: KeepsakeType;
  title: string;
  content: string;
  triggerCondition?: TriggerCondition;
  revealDelay?: number;
  revealDate?: string;
  scheduledAt?: string;
}

export interface UpdateKeepsakeRequest {
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

export interface ConfirmMediaUploadResponse {
  media: Array<{
    id: string;
    key: string;
    filename: string;
    type: MediaType;
    size: number;
    order: number;
  }>;
}

export interface ReorderMediaRequest {
  mediaIds: string[];
}

export interface GetMediaResponse {
  media: KeepsakeMedia[];
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB

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
