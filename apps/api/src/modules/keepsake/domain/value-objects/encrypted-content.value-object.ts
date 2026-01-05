import { ValueObject } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

interface EncryptedContentProps {
  encryptedData: string;
  iv: string;
}

export class EncryptedContent extends ValueObject<EncryptedContentProps> {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;

  private constructor(props: EncryptedContentProps) {
    super(props);
  }

  static encrypt(plaintext: string, encryptionKey: Buffer): Result<EncryptedContent, string> {
    if (!plaintext) {
      return err('Content cannot be empty');
    }

    if (encryptionKey.length !== 32) {
      return err('Encryption key must be 32 bytes');
    }

    const iv = randomBytes(this.IV_LENGTH);
    const cipher = createCipheriv(this.ALGORITHM, encryptionKey, iv, {
      authTagLength: this.AUTH_TAG_LENGTH,
    });

    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

    const authTag = cipher.getAuthTag();
    const encryptedWithTag = Buffer.concat([encrypted, authTag]);

    return ok(
      new EncryptedContent({
        encryptedData: encryptedWithTag.toString('base64'),
        iv: iv.toString('base64'),
      }),
    );
  }

  static fromPersistence(encryptedData: string, iv: string): EncryptedContent {
    return new EncryptedContent({ encryptedData, iv });
  }

  decrypt(encryptionKey: Buffer): Result<string, string> {
    if (encryptionKey.length !== 32) {
      return err('Encryption key must be 32 bytes');
    }

    try {
      const iv = Buffer.from(this.props.iv, 'base64');
      const encryptedBuffer = Buffer.from(this.props.encryptedData, 'base64');

      const authTag = encryptedBuffer.subarray(-EncryptedContent.AUTH_TAG_LENGTH);
      const encrypted = encryptedBuffer.subarray(0, -EncryptedContent.AUTH_TAG_LENGTH);

      const decipher = createDecipheriv(EncryptedContent.ALGORITHM, encryptionKey, iv, {
        authTagLength: EncryptedContent.AUTH_TAG_LENGTH,
      });
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

      return ok(decrypted.toString('utf8'));
    } catch {
      return err('Failed to decrypt content');
    }
  }

  get encryptedData(): string {
    return this.props.encryptedData;
  }

  get iv(): string {
    return this.props.iv;
  }
}
