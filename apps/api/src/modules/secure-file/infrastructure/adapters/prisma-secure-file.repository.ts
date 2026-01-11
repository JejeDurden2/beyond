import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { SecureFile, EncryptionMetadata } from '../../domain';
import { SecureFileRepository } from '../../domain/repositories';

@Injectable()
export class PrismaSecureFileRepository implements SecureFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(file: SecureFile): Promise<void> {
    const metadata = file.encryptionMetadata.toJSON();

    await this.prisma.secureFile.upsert({
      where: { id: file.id },
      update: {
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        storageKey: file.storageKey,
        encryptedKey: metadata.encryptedKey,
        iv: metadata.iv,
        authTag: metadata.authTag,
        algorithm: metadata.algorithm,
        updatedAt: file.updatedAt,
      },
      create: {
        id: file.id,
        ownerId: file.ownerId,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        storageKey: file.storageKey,
        encryptedKey: metadata.encryptedKey,
        iv: metadata.iv,
        authTag: metadata.authTag,
        algorithm: metadata.algorithm,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<SecureFile | null> {
    const record = await this.prisma.secureFile.findUnique({
      where: { id },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  async findByOwnerId(ownerId: string): Promise<SecureFile[]> {
    const records = await this.prisma.secureFile.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.secureFile.delete({
      where: { id },
    });
  }

  async deleteByOwnerId(ownerId: string): Promise<void> {
    await this.prisma.secureFile.deleteMany({
      where: { ownerId },
    });
  }

  private toDomain(record: {
    id: string;
    ownerId: string;
    filename: string;
    mimeType: string;
    size: number;
    storageKey: string;
    encryptedKey: string;
    iv: string;
    authTag: string;
    algorithm: string;
    createdAt: Date;
    updatedAt: Date;
  }): SecureFile {
    const encryptionMetadata = EncryptionMetadata.create({
      encryptedKey: record.encryptedKey,
      iv: record.iv,
      authTag: record.authTag,
      algorithm: record.algorithm,
    });

    return SecureFile.reconstitute({
      id: record.id,
      ownerId: record.ownerId,
      filename: record.filename,
      mimeType: record.mimeType,
      size: record.size,
      storageKey: record.storageKey,
      encryptionMetadata,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
