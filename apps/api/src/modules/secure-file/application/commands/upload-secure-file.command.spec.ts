import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { UploadSecureFileCommand } from './upload-secure-file.command';
import { SecureFileRepository } from '../../domain/repositories';
import { FileStoragePort, EncryptionPort, EncryptResult } from '../ports';
import { SecureFile } from '../../domain';

describe('UploadSecureFileCommand', () => {
  let command: UploadSecureFileCommand;
  let mockRepository: { [K in keyof SecureFileRepository]: Mock };
  let mockStorage: { [K in keyof FileStoragePort]: Mock };
  let mockEncryption: { [K in keyof EncryptionPort]: Mock };

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

    command = new UploadSecureFileCommand(
      mockRepository as unknown as SecureFileRepository,
      mockStorage as unknown as FileStoragePort,
      mockEncryption as unknown as EncryptionPort,
    );
  });

  it('should encrypt file, upload to storage, and save metadata', async () => {
    const input = {
      ownerId: 'user-123',
      filename: 'test-image.jpg',
      mimeType: 'image/jpeg',
      data: Buffer.from('test file content'),
    };

    const encryptResult: EncryptResult = {
      encryptedData: Buffer.from('encrypted content'),
      encryptedKey: 'base64-encrypted-key',
      iv: 'base64-iv',
      authTag: 'base64-auth-tag',
      algorithm: 'aes-256-gcm',
    };

    mockEncryption.encrypt.mockResolvedValue(encryptResult);
    mockStorage.upload.mockResolvedValue(undefined);
    mockRepository.save.mockResolvedValue(undefined);

    const result = await command.execute(input);

    // Verify encryption was called with original data
    expect(mockEncryption.encrypt).toHaveBeenCalledWith(input.data);

    // Verify storage upload was called with encrypted data
    expect(mockStorage.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        data: encryptResult.encryptedData,
        mimeType: 'application/octet-stream',
      }),
    );

    // Verify storage key format
    const uploadCall = mockStorage.upload.mock.calls[0][0];
    expect(uploadCall.key).toMatch(/^secure-files\/user-123\/[\w-]+\.jpg$/);

    // Verify repository save was called
    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(SecureFile));

    // Verify saved entity has correct encryption metadata
    const savedFile = mockRepository.save.mock.calls[0][0] as SecureFile;
    expect(savedFile.ownerId).toBe(input.ownerId);
    expect(savedFile.filename).toBe(input.filename);
    expect(savedFile.mimeType).toBe(input.mimeType);
    expect(savedFile.size).toBe(input.data.length);
    expect(savedFile.encryptionMetadata.encryptedKey).toBe(encryptResult.encryptedKey);
    expect(savedFile.encryptionMetadata.iv).toBe(encryptResult.iv);
    expect(savedFile.encryptionMetadata.authTag).toBe(encryptResult.authTag);

    // Verify result
    expect(result).toMatchObject({
      filename: input.filename,
      mimeType: input.mimeType,
      size: input.data.length,
    });
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('should handle files without extension', async () => {
    const input = {
      ownerId: 'user-123',
      filename: 'noextension',
      mimeType: 'application/octet-stream',
      data: Buffer.from('test'),
    };

    mockEncryption.encrypt.mockResolvedValue({
      encryptedData: Buffer.from('encrypted'),
      encryptedKey: 'key',
      iv: 'iv',
      authTag: 'tag',
      algorithm: 'aes-256-gcm',
    });
    mockStorage.upload.mockResolvedValue(undefined);
    mockRepository.save.mockResolvedValue(undefined);

    await command.execute(input);

    const uploadCall = mockStorage.upload.mock.calls[0][0];
    expect(uploadCall.key).toMatch(/^secure-files\/user-123\/[\w-]+$/);
    expect(uploadCall.key).not.toContain('.');
  });

  it('should propagate encryption errors', async () => {
    mockEncryption.encrypt.mockRejectedValue(new Error('Encryption failed'));

    await expect(
      command.execute({
        ownerId: 'user-123',
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        data: Buffer.from('test'),
      }),
    ).rejects.toThrow('Encryption failed');

    expect(mockStorage.upload).not.toHaveBeenCalled();
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should propagate storage errors', async () => {
    mockEncryption.encrypt.mockResolvedValue({
      encryptedData: Buffer.from('encrypted'),
      encryptedKey: 'key',
      iv: 'iv',
      authTag: 'tag',
      algorithm: 'aes-256-gcm',
    });
    mockStorage.upload.mockRejectedValue(new Error('Storage failed'));

    await expect(
      command.execute({
        ownerId: 'user-123',
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        data: Buffer.from('test'),
      }),
    ).rejects.toThrow('Storage failed');

    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
