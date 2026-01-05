import { describe, it, expect } from 'vitest';
import { Password } from './password.value-object';

describe('Password Value Object', () => {
  describe('create', () => {
    it('should create a valid password with 12+ characters', async () => {
      const result = await Password.create('validPassword123');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.hashedValue).toBeDefined();
        expect(result.value.hashedValue).not.toBe('validPassword123');
      }
    });

    it('should reject empty password', async () => {
      const result = await Password.create('');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe('Password is required');
      }
    });

    it('should reject password shorter than 12 characters', async () => {
      const result = await Password.create('short');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toContain('at least 12 characters');
      }
    });

    it('should reject password with exactly 11 characters', async () => {
      const result = await Password.create('12345678901');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toContain('at least 12 characters');
      }
    });

    it('should accept password with exactly 12 characters', async () => {
      const result = await Password.create('123456789012');

      expect(result.isOk()).toBe(true);
    });

    it('should reject password exceeding 128 characters', async () => {
      const longPassword = 'a'.repeat(129);
      const result = await Password.create(longPassword);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toContain('must not exceed 128 characters');
      }
    });
  });

  describe('compare', () => {
    it('should return true for correct password', async () => {
      const createResult = await Password.create('validPassword123');
      expect(createResult.isOk()).toBe(true);

      if (createResult.isOk()) {
        const isValid = await createResult.value.compare('validPassword123');
        expect(isValid).toBe(true);
      }
    });

    it('should return false for incorrect password', async () => {
      const createResult = await Password.create('validPassword123');
      expect(createResult.isOk()).toBe(true);

      if (createResult.isOk()) {
        const isValid = await createResult.value.compare('wrongPassword123');
        expect(isValid).toBe(false);
      }
    });
  });

  describe('fromHash', () => {
    it('should reconstitute password from hash', () => {
      const hashedValue = '$2b$12$someHashedValue';
      const password = Password.fromHash(hashedValue);

      expect(password.hashedValue).toBe(hashedValue);
    });
  });
});
