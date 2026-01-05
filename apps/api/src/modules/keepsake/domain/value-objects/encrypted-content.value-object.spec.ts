import { describe, it, expect } from 'vitest';
import { EncryptedContent } from './encrypted-content.value-object';
import { randomBytes } from 'crypto';

describe('EncryptedContent Value Object', () => {
  const validKey = randomBytes(32);

  describe('encrypt', () => {
    it('should encrypt content successfully', () => {
      const result = EncryptedContent.encrypt('Hello World', validKey);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.encryptedData).toBeDefined();
        expect(result.value.iv).toBeDefined();
      }
    });

    it('should generate unique IVs for same content', () => {
      const result1 = EncryptedContent.encrypt('Hello World', validKey);
      const result2 = EncryptedContent.encrypt('Hello World', validKey);

      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);

      if (result1.isOk() && result2.isOk()) {
        expect(result1.value.iv).not.toBe(result2.value.iv);
        expect(result1.value.encryptedData).not.toBe(result2.value.encryptedData);
      }
    });

    it('should reject empty content', () => {
      const result = EncryptedContent.encrypt('', validKey);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toContain('Content cannot be empty');
      }
    });

    it('should reject invalid key length', () => {
      const shortKey = randomBytes(16);
      const result = EncryptedContent.encrypt('Hello World', shortKey);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toContain('Encryption key must be 32 bytes');
      }
    });
  });

  describe('decrypt', () => {
    it('should decrypt content successfully', () => {
      const originalContent = 'Hello World';
      const encryptResult = EncryptedContent.encrypt(originalContent, validKey);

      expect(encryptResult.isOk()).toBe(true);
      if (encryptResult.isOk()) {
        const decryptResult = encryptResult.value.decrypt(validKey);

        expect(decryptResult.isOk()).toBe(true);
        if (decryptResult.isOk()) {
          expect(decryptResult.value).toBe(originalContent);
        }
      }
    });

    it('should handle unicode content', () => {
      const originalContent = 'Hello 世界 🌍';
      const encryptResult = EncryptedContent.encrypt(originalContent, validKey);

      expect(encryptResult.isOk()).toBe(true);
      if (encryptResult.isOk()) {
        const decryptResult = encryptResult.value.decrypt(validKey);

        expect(decryptResult.isOk()).toBe(true);
        if (decryptResult.isOk()) {
          expect(decryptResult.value).toBe(originalContent);
        }
      }
    });

    it('should fail with wrong key', () => {
      const encryptResult = EncryptedContent.encrypt('Hello World', validKey);

      expect(encryptResult.isOk()).toBe(true);
      if (encryptResult.isOk()) {
        const wrongKey = randomBytes(32);
        const decryptResult = encryptResult.value.decrypt(wrongKey);

        expect(decryptResult.isErr()).toBe(true);
        if (decryptResult.isErr()) {
          expect(decryptResult.error).toContain('Failed to decrypt');
        }
      }
    });

    it('should reject invalid key length on decrypt', () => {
      const encryptResult = EncryptedContent.encrypt('Hello World', validKey);

      expect(encryptResult.isOk()).toBe(true);
      if (encryptResult.isOk()) {
        const shortKey = randomBytes(16);
        const decryptResult = encryptResult.value.decrypt(shortKey);

        expect(decryptResult.isErr()).toBe(true);
        if (decryptResult.isErr()) {
          expect(decryptResult.error).toContain('Encryption key must be 32 bytes');
        }
      }
    });
  });

  describe('fromPersistence', () => {
    it('should reconstitute from persisted data', () => {
      const encryptResult = EncryptedContent.encrypt('Hello World', validKey);

      expect(encryptResult.isOk()).toBe(true);
      if (encryptResult.isOk()) {
        const persisted = encryptResult.value;
        const reconstituted = EncryptedContent.fromPersistence(
          persisted.encryptedData,
          persisted.iv,
        );

        const decryptResult = reconstituted.decrypt(validKey);
        expect(decryptResult.isOk()).toBe(true);
        if (decryptResult.isOk()) {
          expect(decryptResult.value).toBe('Hello World');
        }
      }
    });
  });
});
