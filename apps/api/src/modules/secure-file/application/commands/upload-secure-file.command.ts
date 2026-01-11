import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SecureFile, EncryptionMetadata } from '../../domain';
import { SECURE_FILE_REPOSITORY, SecureFileRepository } from '../../domain/repositories';
import { FILE_STORAGE_PORT, FileStoragePort, ENCRYPTION_PORT, EncryptionPort } from '../ports';

export interface UploadSecureFileInput {
  ownerId: string;
  filename: string;
  mimeType: string;
  data: Buffer;
}

export interface UploadSecureFileOutput {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

@Injectable()
export class UploadSecureFileCommand {
  constructor(
    @Inject(SECURE_FILE_REPOSITORY)
    private readonly repository: SecureFileRepository,
    @Inject(FILE_STORAGE_PORT)
    private readonly storage: FileStoragePort,
    @Inject(ENCRYPTION_PORT)
    private readonly encryption: EncryptionPort,
  ) {}

  async execute(input: UploadSecureFileInput): Promise<UploadSecureFileOutput> {
    const encryptResult = await this.encryption.encrypt(input.data);

    const extension = this.getFileExtension(input.filename);
    const storageKey = `secure-files/${input.ownerId}/${randomUUID()}${extension}`;

    await this.storage.upload({
      key: storageKey,
      data: encryptResult.encryptedData,
      mimeType: 'application/octet-stream',
    });

    const encryptionMetadata = EncryptionMetadata.create({
      encryptedKey: encryptResult.encryptedKey,
      iv: encryptResult.iv,
      authTag: encryptResult.authTag,
      algorithm: encryptResult.algorithm,
    });

    const secureFile = SecureFile.create({
      ownerId: input.ownerId,
      filename: input.filename,
      mimeType: input.mimeType,
      size: input.data.length,
      storageKey,
      encryptionMetadata,
    });

    await this.repository.save(secureFile);

    return {
      id: secureFile.id,
      filename: secureFile.filename,
      mimeType: secureFile.mimeType,
      size: secureFile.size,
      createdAt: secureFile.createdAt,
    };
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.substring(lastDot);
  }
}
