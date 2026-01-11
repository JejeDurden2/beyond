import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SECURE_FILE_REPOSITORY, SecureFileRepository } from '../../domain/repositories';
import { FILE_STORAGE_PORT, FileStoragePort, ENCRYPTION_PORT, EncryptionPort } from '../ports';

export interface GetSecureFileUrlInput {
  fileId: string;
  userId: string;
}

export interface GetSecureFileUrlOutput {
  url: string;
  expiresAt: Date;
  decryption: {
    key: string; // Base64 encoded DEK for client-side decryption
    iv: string; // Base64 encoded
    authTag: string; // Base64 encoded
    algorithm: string;
  };
  file: {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
  };
}

@Injectable()
export class GetSecureFileUrlQuery {
  constructor(
    @Inject(SECURE_FILE_REPOSITORY)
    private readonly repository: SecureFileRepository,
    @Inject(FILE_STORAGE_PORT)
    private readonly storage: FileStoragePort,
    @Inject(ENCRYPTION_PORT)
    private readonly encryption: EncryptionPort,
  ) {}

  async execute(input: GetSecureFileUrlInput): Promise<GetSecureFileUrlOutput> {
    const file = await this.repository.findById(input.fileId);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (!file.isOwnedBy(input.userId)) {
      throw new ForbiddenException('You do not have permission to access this file');
    }

    const { url, expiresAt } = await this.storage.generateSignedUrl({
      key: file.storageKey,
      expiresInSeconds: 600,
    });

    const { encryptedKey, iv, authTag, algorithm } = file.encryptionMetadata;
    const decryption = await this.encryption.getDecryptionParams(
      encryptedKey,
      iv,
      authTag,
      algorithm,
    );

    return {
      url,
      expiresAt,
      decryption,
      file: {
        id: file.id,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
      },
    };
  }
}
