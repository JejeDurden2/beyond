import { describe, it, expect } from 'vitest';
import { Vault, VaultStatus } from './vault.entity';
import { EncryptionSalt } from '../value-objects/encryption-salt.value-object';

describe('Vault Entity', () => {
  describe('create', () => {
    it('should create a valid vault with userId', () => {
      const result = Vault.create({ userId: 'user-123' });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const vault = result.value;
        expect(vault.userId).toBe('user-123');
        expect(vault.status).toBe(VaultStatus.ACTIVE);
        expect(vault.encryptionSalt).toBeInstanceOf(EncryptionSalt);
        expect(vault.id).toBeDefined();
      }
    });

    it('should auto-generate encryption salt', () => {
      const result1 = Vault.create({ userId: 'user-123' });
      const result2 = Vault.create({ userId: 'user-456' });

      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);

      if (result1.isOk() && result2.isOk()) {
        expect(result1.value.encryptionSalt.value).not.toBe(result2.value.encryptionSalt.value);
      }
    });

    it('should reject empty userId', () => {
      const result = Vault.create({ userId: '' });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toContain('User ID is required');
      }
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute vault from persisted data', () => {
      const encryptionSalt = EncryptionSalt.generate();
      const vault = Vault.reconstitute({
        id: 'vault-123',
        userId: 'user-123',
        status: VaultStatus.ACTIVE,
        encryptionSalt,
        unsealedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });

      expect(vault.id).toBe('vault-123');
      expect(vault.userId).toBe('user-123');
      expect(vault.status).toBe(VaultStatus.ACTIVE);
      expect(vault.encryptionSalt).toBe(encryptionSalt);
    });
  });

  describe('status checks', () => {
    it('should correctly identify active vault', () => {
      const result = Vault.create({ userId: 'user-123' });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.isActive()).toBe(true);
        expect(result.value.isPendingVerification()).toBe(false);
        expect(result.value.isUnsealed()).toBe(false);
      }
    });
  });

  describe('startVerification', () => {
    it('should transition from active to pending_verification', () => {
      const result = Vault.create({ userId: 'user-123' });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const vault = result.value;
        vault.startVerification();

        expect(vault.status).toBe(VaultStatus.PENDING_VERIFICATION);
        expect(vault.isPendingVerification()).toBe(true);
      }
    });

    it('should return error if not active', () => {
      const encryptionSalt = EncryptionSalt.generate();
      const vault = Vault.reconstitute({
        id: 'vault-123',
        userId: 'user-123',
        status: VaultStatus.PENDING_VERIFICATION,
        encryptionSalt,
        unsealedAt: null,
      });

      const result = vault.startVerification();
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe('Vault must be active to start verification');
      }
    });
  });

  describe('unseal', () => {
    it('should transition from pending_verification to unsealed', () => {
      const encryptionSalt = EncryptionSalt.generate();
      const vault = Vault.reconstitute({
        id: 'vault-123',
        userId: 'user-123',
        status: VaultStatus.PENDING_VERIFICATION,
        encryptionSalt,
        unsealedAt: null,
      });

      vault.unseal();

      expect(vault.status).toBe(VaultStatus.UNSEALED);
      expect(vault.isUnsealed()).toBe(true);
      expect(vault.unsealedAt).toBeInstanceOf(Date);
    });

    it('should return error if not pending verification', () => {
      const result = Vault.create({ userId: 'user-123' });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const unsealResult = result.value.unseal();
        expect(unsealResult.isErr()).toBe(true);
        if (unsealResult.isErr()) {
          expect(unsealResult.error).toBe('Vault must be pending verification to unseal');
        }
      }
    });
  });

  describe('cancelVerification', () => {
    it('should transition from pending_verification back to active', () => {
      const encryptionSalt = EncryptionSalt.generate();
      const vault = Vault.reconstitute({
        id: 'vault-123',
        userId: 'user-123',
        status: VaultStatus.PENDING_VERIFICATION,
        encryptionSalt,
        unsealedAt: null,
      });

      const result = vault.cancelVerification();
      expect(result.isOk()).toBe(true);

      expect(vault.status).toBe(VaultStatus.ACTIVE);
      expect(vault.isActive()).toBe(true);
    });

    it('should return error if not pending verification', () => {
      const result = Vault.create({ userId: 'user-123' });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const cancelResult = result.value.cancelVerification();
        expect(cancelResult.isErr()).toBe(true);
        if (cancelResult.isErr()) {
          expect(cancelResult.error).toBe('Vault must be pending verification to cancel');
        }
      }
    });
  });
});
