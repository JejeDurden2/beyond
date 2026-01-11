import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { EncryptionPort, EncryptResult, DecryptKeyResult } from '../../application/ports';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended IV length
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

@Injectable()
export class AesEncryptionAdapter implements EncryptionPort, OnModuleInit {
  private masterKey!: Buffer;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const masterKeySecret = this.configService.getOrThrow<string>('ENCRYPTION_MASTER_KEY');
    // Derive a proper 256-bit key from the master secret using scrypt
    this.masterKey = scryptSync(masterKeySecret, 'secure-file-salt', KEY_LENGTH);
  }

  async encrypt(data: Buffer): Promise<EncryptResult> {
    const dek = randomBytes(KEY_LENGTH);
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, dek, iv, { authTagLength: AUTH_TAG_LENGTH });
    const encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const dekIv = randomBytes(IV_LENGTH);
    const dekCipher = createCipheriv(ALGORITHM, this.masterKey, dekIv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    const encryptedDek = Buffer.concat([dekCipher.update(dek), dekCipher.final()]);
    const dekAuthTag = dekCipher.getAuthTag();

    const encryptedKeyBuffer = Buffer.concat([dekIv, dekAuthTag, encryptedDek]);

    return {
      encryptedData,
      encryptedKey: encryptedKeyBuffer.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      algorithm: ALGORITHM,
    };
  }

  async decryptKey(encryptedKey: string): Promise<string> {
    const encryptedKeyBuffer = Buffer.from(encryptedKey, 'base64');

    const dekIv = encryptedKeyBuffer.subarray(0, IV_LENGTH);
    const dekAuthTag = encryptedKeyBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encryptedDek = encryptedKeyBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, this.masterKey, dekIv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(dekAuthTag);

    const dek = Buffer.concat([decipher.update(encryptedDek), decipher.final()]);

    return dek.toString('base64');
  }

  async getDecryptionParams(
    encryptedKey: string,
    iv: string,
    authTag: string,
    algorithm: string,
  ): Promise<DecryptKeyResult> {
    const decryptedKey = await this.decryptKey(encryptedKey);

    return {
      key: decryptedKey,
      iv,
      authTag,
      algorithm,
    };
  }
}
