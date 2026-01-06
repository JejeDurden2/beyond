export const STORAGE_SERVICE = 'StorageService';

export interface PresignedUploadUrl {
  url: string;
  key: string;
  expiresAt: Date;
}

export interface PresignedDownloadUrl {
  url: string;
  expiresAt: Date;
}

export interface GenerateUploadUrlInput {
  filename: string;
  mimeType: string;
  keepsakeId: string;
}

export interface StorageService {
  generateUploadUrl(input: GenerateUploadUrlInput): Promise<PresignedUploadUrl>;
  generateDownloadUrl(key: string): Promise<PresignedDownloadUrl>;
  deleteObject(key: string): Promise<void>;
  deleteObjects(keys: string[]): Promise<void>;
}
