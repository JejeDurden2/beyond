export const ENCRYPTION_PORT = Symbol('ENCRYPTION_PORT');

export interface EncryptResult {
  encryptedData: Buffer;
  encryptedKey: string; // Base64 encoded DEK encrypted with master key
  iv: string; // Base64 encoded
  authTag: string; // Base64 encoded
  algorithm: string;
}

export interface DecryptKeyResult {
  key: string; // Base64 encoded decrypted DEK (for client-side decryption)
  iv: string; // Base64 encoded
  authTag: string; // Base64 encoded
  algorithm: string;
}

export interface EncryptionPort {
  /**
   * Encrypt file data using envelope encryption:
   * 1. Generate a unique Data Encryption Key (DEK)
   * 2. Encrypt file with DEK using AES-256-GCM
   * 3. Encrypt DEK with master key
   * 4. Return encrypted data + encrypted DEK + IV + authTag
   */
  encrypt(data: Buffer): Promise<EncryptResult>;

  /**
   * Decrypt the DEK using the master key
   * Returns the decrypted DEK for client-side decryption
   */
  decryptKey(encryptedKey: string): Promise<string>;

  /**
   * Generate encryption metadata for client-side decryption
   */
  getDecryptionParams(
    encryptedKey: string,
    iv: string,
    authTag: string,
    algorithm: string,
  ): Promise<DecryptKeyResult>;
}
