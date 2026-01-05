import { describe, it, expect } from 'vitest';
import { User } from './user.entity';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a valid user', async () => {
      const result = await User.create({
        email: 'test@example.com',
        password: 'validPassword123',
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const user = result.value;
        expect(user.email.value).toBe('test@example.com');
        expect(user.emailVerified).toBe(false);
        expect(user.emailVerificationToken).toBeDefined();
        expect(user.emailVerificationToken).toHaveLength(64); // 32 bytes hex
        expect(user.id).toBeDefined();
      }
    });

    it('should reject invalid email', async () => {
      const result = await User.create({
        email: 'invalid-email',
        password: 'validPassword123',
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toContain('email');
      }
    });

    it('should reject invalid password', async () => {
      const result = await User.create({
        email: 'test@example.com',
        password: 'short',
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toContain('12 characters');
      }
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with correct token', async () => {
      const createResult = await User.create({
        email: 'test@example.com',
        password: 'validPassword123',
      });

      expect(createResult.isOk()).toBe(true);
      if (createResult.isOk()) {
        const user = createResult.value;
        const token = user.emailVerificationToken!;

        const verifyResult = user.verifyEmail(token);

        expect(verifyResult.isOk()).toBe(true);
        expect(user.emailVerified).toBe(true);
        expect(user.emailVerificationToken).toBeNull();
      }
    });

    it('should reject invalid token', async () => {
      const createResult = await User.create({
        email: 'test@example.com',
        password: 'validPassword123',
      });

      expect(createResult.isOk()).toBe(true);
      if (createResult.isOk()) {
        const user = createResult.value;

        const verifyResult = user.verifyEmail('invalid-token');

        expect(verifyResult.isErr()).toBe(true);
        if (verifyResult.isErr()) {
          expect(verifyResult.error).toContain('Invalid verification token');
        }
        expect(user.emailVerified).toBe(false);
      }
    });

    it('should reject if already verified', async () => {
      const createResult = await User.create({
        email: 'test@example.com',
        password: 'validPassword123',
      });

      expect(createResult.isOk()).toBe(true);
      if (createResult.isOk()) {
        const user = createResult.value;
        const token = user.emailVerificationToken!;

        user.verifyEmail(token);
        const secondResult = user.verifyEmail(token);

        expect(secondResult.isErr()).toBe(true);
        if (secondResult.isErr()) {
          expect(secondResult.error).toContain('already verified');
        }
      }
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const createResult = await User.create({
        email: 'test@example.com',
        password: 'validPassword123',
      });

      expect(createResult.isOk()).toBe(true);
      if (createResult.isOk()) {
        const user = createResult.value;
        const isValid = await user.verifyPassword('validPassword123');
        expect(isValid).toBe(true);
      }
    });

    it('should return false for incorrect password', async () => {
      const createResult = await User.create({
        email: 'test@example.com',
        password: 'validPassword123',
      });

      expect(createResult.isOk()).toBe(true);
      if (createResult.isOk()) {
        const user = createResult.value;
        const isValid = await user.verifyPassword('wrongPassword123');
        expect(isValid).toBe(false);
      }
    });
  });
});
