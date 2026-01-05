import { describe, it, expect } from 'vitest';
import { EncryptionSalt } from './encryption-salt.value-object';

describe('EncryptionSalt Value Object', () => {
  describe('generate', () => {
    it('should generate a valid encryption salt', () => {
      const salt = EncryptionSalt.generate();

      expect(salt).toBeInstanceOf(EncryptionSalt);
      expect(salt.value).toBeDefined();
      expect(typeof salt.value).toBe('string');
    });

    it('should generate unique salts each time', () => {
      const salt1 = EncryptionSalt.generate();
      const salt2 = EncryptionSalt.generate();

      expect(salt1.value).not.toBe(salt2.value);
    });

    it('should generate base64-encoded salt', () => {
      const salt = EncryptionSalt.generate();

      // Base64 regex pattern
      const base64Regex = /^[A-Za-z0-9+/]+=*$/;
      expect(salt.value).toMatch(base64Regex);
    });

    it('should generate salt of expected length (32 bytes = 44 chars base64)', () => {
      const salt = EncryptionSalt.generate();

      // 32 bytes in base64 is 44 characters (with padding)
      expect(salt.value.length).toBe(44);
    });
  });

  describe('fromString', () => {
    it('should reconstitute salt from string', () => {
      const originalSalt = EncryptionSalt.generate();
      const reconstituted = EncryptionSalt.fromString(originalSalt.value);

      expect(reconstituted.value).toBe(originalSalt.value);
    });

    it('should preserve value when reconstituting', () => {
      const testValue = 'dGVzdFNhbHRWYWx1ZUZvclRlc3Rpbmc=';
      const salt = EncryptionSalt.fromString(testValue);

      expect(salt.value).toBe(testValue);
    });
  });

  describe('equals', () => {
    it('should return true for equal salts', () => {
      const value = 'dGVzdFNhbHRWYWx1ZUZvclRlc3Rpbmc=';
      const salt1 = EncryptionSalt.fromString(value);
      const salt2 = EncryptionSalt.fromString(value);

      expect(salt1.equals(salt2)).toBe(true);
    });

    it('should return false for different salts', () => {
      const salt1 = EncryptionSalt.generate();
      const salt2 = EncryptionSalt.generate();

      expect(salt1.equals(salt2)).toBe(false);
    });
  });
});
