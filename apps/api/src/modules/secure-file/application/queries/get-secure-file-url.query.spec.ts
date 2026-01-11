import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetSecureFileUrlQuery } from './get-secure-file-url.query';
import { SecureFileRepository } from '../../domain/repositories';
import { FileStoragePort, EncryptionPort, DecryptKeyResult } from '../ports';
import { SecureFile, EncryptionMetadata } from '../../domain';

describe('GetSecureFileUrlQuery', () => {
  let query: GetSecureFileUrlQuery;
  let mockRepository: { [K in keyof SecureFileRepository]: Mock };
  let mockStorage: { [K in keyof FileStoragePort]: Mock };
  let mockEncryption: { [K in keyof EncryptionPort]: Mock };

  const createMockFile = (ownerId: string): SecureFile => {
    const metadata = EncryptionMetadata.create({
      encryptedKey: 'encrypted-dek',
      iv: 'test-iv',
      authTag: 'test-auth-tag',
      algorithm: 'aes-256-gcm',
    });

    return SecureFile.reconstitute({
      id: 'file-123',
      ownerId,
      filename: 'test.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      storageKey: 'secure-files/user-123/uuid.jpg',
      encryptionMetadata: metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByOwnerId: vi.fn(),
      delete: vi.fn(),
      deleteByOwnerId: vi.fn(),
    };

    mockStorage = {
      upload: vi.fn(),
      generateSignedUrl: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    };

    mockEncryption = {
      encrypt: vi.fn(),
      decryptKey: vi.fn(),
      getDecryptionParams: vi.fn(),
    };

    query = new GetSecureFileUrlQuery(
      mockRepository as unknown as SecureFileRepository,
      mockStorage as unknown as FileStoragePort,
      mockEncryption as unknown as EncryptionPort,
    );
  });

  it('should return signed URL and decryption params for file owner', async () => {
    const userId = 'user-123';
    const file = createMockFile(userId);
    const expiresAt = new Date(Date.now() + 600000);

    mockRepository.findById.mockResolvedValue(file);
    mockStorage.generateSignedUrl.mockResolvedValue({
      url: 'https://r2.example.com/signed-url',
      expiresAt,
    });

    const decryptionParams: DecryptKeyResult = {
      key: 'decrypted-dek-base64',
      iv: 'test-iv',
      authTag: 'test-auth-tag',
      algorithm: 'aes-256-gcm',
    };
    mockEncryption.getDecryptionParams.mockResolvedValue(decryptionParams);

    const result = await query.execute({
      fileId: 'file-123',
      userId,
    });

    expect(mockRepository.findById).toHaveBeenCalledWith('file-123');
    expect(mockStorage.generateSignedUrl).toHaveBeenCalledWith({
      key: file.storageKey,
      expiresInSeconds: 600,
    });
    expect(mockEncryption.getDecryptionParams).toHaveBeenCalledWith(
      'encrypted-dek',
      'test-iv',
      'test-auth-tag',
      'aes-256-gcm',
    );

    expect(result).toEqual({
      url: 'https://r2.example.com/signed-url',
      expiresAt,
      decryption: decryptionParams,
      file: {
        id: file.id,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
      },
    });
  });

  it('should throw NotFoundException when file does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      query.execute({
        fileId: 'non-existent',
        userId: 'user-123',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(mockStorage.generateSignedUrl).not.toHaveBeenCalled();
    expect(mockEncryption.getDecryptionParams).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user does not own the file', async () => {
    const file = createMockFile('owner-user');
    mockRepository.findById.mockResolvedValue(file);

    await expect(
      query.execute({
        fileId: 'file-123',
        userId: 'different-user',
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(mockStorage.generateSignedUrl).not.toHaveBeenCalled();
    expect(mockEncryption.getDecryptionParams).not.toHaveBeenCalled();
  });

  it('should propagate storage errors', async () => {
    const file = createMockFile('user-123');
    mockRepository.findById.mockResolvedValue(file);
    mockStorage.generateSignedUrl.mockRejectedValue(new Error('Storage error'));

    await expect(
      query.execute({
        fileId: 'file-123',
        userId: 'user-123',
      }),
    ).rejects.toThrow('Storage error');
  });

  it('should propagate encryption errors', async () => {
    const file = createMockFile('user-123');
    mockRepository.findById.mockResolvedValue(file);
    mockStorage.generateSignedUrl.mockResolvedValue({
      url: 'https://example.com',
      expiresAt: new Date(),
    });
    mockEncryption.getDecryptionParams.mockRejectedValue(new Error('Decryption error'));

    await expect(
      query.execute({
        fileId: 'file-123',
        userId: 'user-123',
      }),
    ).rejects.toThrow('Decryption error');
  });
});
