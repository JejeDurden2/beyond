import { describe, it, expect } from 'vitest';
import { Keepsake, KeepsakeType } from './keepsake.entity';
import { randomBytes } from 'crypto';

describe('Keepsake Entity', () => {
  const validKey = randomBytes(32);

  describe('create', () => {
    it('should create a valid keepsake', () => {
      const result = Keepsake.create({
        vaultId: 'vault-123',
        type: KeepsakeType.DOCUMENT,
        title: 'My Message',
        content: 'Hello, this is my message.',
        encryptionKey: validKey,
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const keepsake = result.value;
        expect(keepsake.vaultId).toBe('vault-123');
        expect(keepsake.type).toBe(KeepsakeType.DOCUMENT);
        expect(keepsake.title).toBe('My Message');
        expect(keepsake.id).toBeDefined();
      }
    });

    it('should encrypt content on creation', () => {
      const result = Keepsake.create({
        vaultId: 'vault-123',
        type: KeepsakeType.LETTER,
        title: 'My Letter',
        content: 'Dear friend...',
        encryptionKey: validKey,
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const keepsake = result.value;
        expect(keepsake.encryptedContent).toBeDefined();
        expect(keepsake.encryptedContent.encryptedData).toBeDefined();
        expect(keepsake.encryptedContent.iv).toBeDefined();
      }
    });

    it('should support all keepsake types', () => {
      const types = [
        KeepsakeType.DOCUMENT,
        KeepsakeType.LETTER,
        KeepsakeType.PHOTO,
        KeepsakeType.VIDEO,
        KeepsakeType.WISH,
        KeepsakeType.SCHEDULED_ACTION,
      ];

      for (const type of types) {
        const result = Keepsake.create({
          vaultId: 'vault-123',
          type,
          title: `Keepsake of type ${type}`,
          content: 'Content',
          encryptionKey: validKey,
        });

        expect(result.isOk()).toBe(true);
      }
    });

    it('should set reveal delay when provided', () => {
      const result = Keepsake.create({
        vaultId: 'vault-123',
        type: KeepsakeType.DOCUMENT,
        title: 'Delayed Message',
        content: 'This will be revealed later.',
        encryptionKey: validKey,
        revealDelay: 30,
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.revealDelay).toBe(30);
      }
    });

    it('should set reveal date when provided', () => {
      const revealDate = new Date('2025-12-25');
      const result = Keepsake.create({
        vaultId: 'vault-123',
        type: KeepsakeType.DOCUMENT,
        title: 'Christmas Message',
        content: 'Merry Christmas!',
        encryptionKey: validKey,
        revealDate,
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.revealDate).toEqual(revealDate);
      }
    });

    it('should reject empty title', () => {
      const result = Keepsake.create({
        vaultId: 'vault-123',
        type: KeepsakeType.DOCUMENT,
        title: '',
        content: 'Content',
        encryptionKey: validKey,
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toContain('Title must be at least');
      }
    });

    it('should reject title exceeding max length', () => {
      const result = Keepsake.create({
        vaultId: 'vault-123',
        type: KeepsakeType.DOCUMENT,
        title: 'a'.repeat(256),
        content: 'Content',
        encryptionKey: validKey,
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toContain('Title must not exceed');
      }
    });

    it('should reject empty vaultId', () => {
      const result = Keepsake.create({
        vaultId: '',
        type: KeepsakeType.DOCUMENT,
        title: 'Title',
        content: 'Content',
        encryptionKey: validKey,
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toContain('Vault ID is required');
      }
    });
  });

  describe('decryptContent', () => {
    it('should decrypt content successfully', () => {
      const originalContent = 'This is my secret message.';
      const createResult = Keepsake.create({
        vaultId: 'vault-123',
        type: KeepsakeType.DOCUMENT,
        title: 'Secret',
        content: originalContent,
        encryptionKey: validKey,
      });

      expect(createResult.isOk()).toBe(true);
      if (createResult.isOk()) {
        const decryptResult = createResult.value.decryptContent(validKey);

        expect(decryptResult.isOk()).toBe(true);
        if (decryptResult.isOk()) {
          expect(decryptResult.value).toBe(originalContent);
        }
      }
    });

    it('should fail with wrong key', () => {
      const createResult = Keepsake.create({
        vaultId: 'vault-123',
        type: KeepsakeType.DOCUMENT,
        title: 'Secret',
        content: 'Secret content',
        encryptionKey: validKey,
      });

      expect(createResult.isOk()).toBe(true);
      if (createResult.isOk()) {
        const wrongKey = randomBytes(32);
        const decryptResult = createResult.value.decryptContent(wrongKey);

        expect(decryptResult.isErr()).toBe(true);
      }
    });
  });

  describe('update', () => {
    it('should update title', () => {
      const createResult = Keepsake.create({
        vaultId: 'vault-123',
        type: KeepsakeType.DOCUMENT,
        title: 'Original Title',
        content: 'Content',
        encryptionKey: validKey,
      });

      expect(createResult.isOk()).toBe(true);
      if (createResult.isOk()) {
        const keepsake = createResult.value;
        const updateResult = keepsake.update({ title: 'New Title' });

        expect(updateResult.isOk()).toBe(true);
        expect(keepsake.title).toBe('New Title');
      }
    });

    it('should update content when key provided', () => {
      const createResult = Keepsake.create({
        vaultId: 'vault-123',
        type: KeepsakeType.DOCUMENT,
        title: 'Title',
        content: 'Original content',
        encryptionKey: validKey,
      });

      expect(createResult.isOk()).toBe(true);
      if (createResult.isOk()) {
        const keepsake = createResult.value;
        const originalIv = keepsake.encryptedContent.iv;

        const updateResult = keepsake.update({
          content: 'New content',
          encryptionKey: validKey,
        });

        expect(updateResult.isOk()).toBe(true);
        expect(keepsake.encryptedContent.iv).not.toBe(originalIv);

        const decryptResult = keepsake.decryptContent(validKey);
        expect(decryptResult.isOk()).toBe(true);
        if (decryptResult.isOk()) {
          expect(decryptResult.value).toBe('New content');
        }
      }
    });

    it('should update reveal delay', () => {
      const createResult = Keepsake.create({
        vaultId: 'vault-123',
        type: KeepsakeType.DOCUMENT,
        title: 'Title',
        content: 'Content',
        encryptionKey: validKey,
      });

      expect(createResult.isOk()).toBe(true);
      if (createResult.isOk()) {
        const keepsake = createResult.value;
        const updateResult = keepsake.update({ revealDelay: 60 });

        expect(updateResult.isOk()).toBe(true);
        expect(keepsake.revealDelay).toBe(60);
      }
    });

    it('should reject invalid title on update', () => {
      const createResult = Keepsake.create({
        vaultId: 'vault-123',
        type: KeepsakeType.DOCUMENT,
        title: 'Original Title',
        content: 'Content',
        encryptionKey: validKey,
      });

      expect(createResult.isOk()).toBe(true);
      if (createResult.isOk()) {
        const keepsake = createResult.value;
        const updateResult = keepsake.update({ title: '' });

        expect(updateResult.isErr()).toBe(true);
      }
    });
  });
});
