export const FILE_STORAGE_PORT = Symbol('FILE_STORAGE_PORT');

export interface UploadFileInput {
  key: string;
  data: Buffer;
  mimeType: string;
}

export interface GenerateSignedUrlInput {
  key: string;
  expiresInSeconds?: number;
}

export interface SignedUrlResult {
  url: string;
  expiresAt: Date;
}

export interface FileStoragePort {
  /**
   * Upload encrypted file data to storage
   */
  upload(input: UploadFileInput): Promise<void>;

  /**
   * Generate a time-limited signed URL for downloading a file
   */
  generateSignedUrl(input: GenerateSignedUrlInput): Promise<SignedUrlResult>;

  /**
   * Delete a file from storage
   */
  delete(key: string): Promise<void>;

  /**
   * Delete multiple files from storage
   */
  deleteMany(keys: string[]): Promise<void>;
}
