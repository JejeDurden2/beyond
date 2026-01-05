import { describe, it, expect } from 'vitest';
import { Email } from './email.value-object';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const result = Email.create('test@example.com');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.value).toBe('test@example.com');
      }
    });

    it('should normalize email to lowercase', () => {
      const result = Email.create('Test@EXAMPLE.COM');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.value).toBe('test@example.com');
      }
    });

    it('should trim whitespace', () => {
      const result = Email.create('  test@example.com  ');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.value).toBe('test@example.com');
      }
    });

    it('should reject empty email', () => {
      const result = Email.create('');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe('Email is required');
      }
    });

    it('should reject invalid email format - no @', () => {
      const result = Email.create('testexample.com');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe('Invalid email format');
      }
    });

    it('should reject invalid email format - no domain', () => {
      const result = Email.create('test@');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe('Invalid email format');
      }
    });

    it('should reject invalid email format - no local part', () => {
      const result = Email.create('@example.com');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe('Invalid email format');
      }
    });

    it('should reject email exceeding max length', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = Email.create(longEmail);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toContain('must not exceed');
      }
    });
  });

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');

      if (email1.isOk() && email2.isOk()) {
        expect(email1.value.equals(email2.value)).toBe(true);
      }
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');

      if (email1.isOk() && email2.isOk()) {
        expect(email1.value.equals(email2.value)).toBe(false);
      }
    });
  });
});
