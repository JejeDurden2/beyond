import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteSecureFileCommand } from './delete-secure-file.command';
import { SecureFileRepository } from '../../domain/repositories';
import { FileStoragePort } from '../ports';
import { SecureFile, EncryptionMetadata } from '../../domain';

describe('DeleteSecureFileCommand', () => {
  let command: DeleteSecureFileCommand;
  let mockRepository: { [K in keyof SecureFileRepository]: Mock };
  let mockStorage: { [K in keyof FileStoragePort]: Mock };

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

    command = new DeleteSecureFileCommand(
      mockRepository as unknown as SecureFileRepository,
      mockStorage as unknown as FileStoragePort,
    );
  });

  it('should delete file from storage and database', async () => {
    const userId = 'user-123';
    const file = createMockFile(userId);

    mockRepository.findById.mockResolvedValue(file);
    mockStorage.delete.mockResolvedValue(undefined);
    mockRepository.delete.mockResolvedValue(undefined);

    await command.execute({
      fileId: 'file-123',
      userId,
    });

    expect(mockRepository.findById).toHaveBeenCalledWith('file-123');
    expect(mockStorage.delete).toHaveBeenCalledWith(file.storageKey);
    expect(mockRepository.delete).toHaveBeenCalledWith(file.id);
  });

  it('should throw NotFoundException when file does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      command.execute({
        fileId: 'non-existent',
        userId: 'user-123',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(mockStorage.delete).not.toHaveBeenCalled();
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user does not own the file', async () => {
    const file = createMockFile('owner-user');
    mockRepository.findById.mockResolvedValue(file);

    await expect(
      command.execute({
        fileId: 'file-123',
        userId: 'different-user',
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(mockStorage.delete).not.toHaveBeenCalled();
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should delete from storage before database', async () => {
    const userId = 'user-123';
    const file = createMockFile(userId);
    const callOrder: string[] = [];

    mockRepository.findById.mockResolvedValue(file);
    mockStorage.delete.mockImplementation(async () => {
      callOrder.push('storage');
    });
    mockRepository.delete.mockImplementation(async () => {
      callOrder.push('repository');
    });

    await command.execute({
      fileId: 'file-123',
      userId,
    });

    expect(callOrder).toEqual(['storage', 'repository']);
  });

  it('should not delete from database if storage deletion fails', async () => {
    const userId = 'user-123';
    const file = createMockFile(userId);

    mockRepository.findById.mockResolvedValue(file);
    mockStorage.delete.mockRejectedValue(new Error('Storage error'));

    await expect(
      command.execute({
        fileId: 'file-123',
        userId,
      }),
    ).rejects.toThrow('Storage error');

    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
});
