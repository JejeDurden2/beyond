export interface EncryptionMetadataProps {
  encryptedKey: string; // Base64 encoded encrypted DEK
  iv: string; // Base64 encoded initialization vector
  authTag: string; // Base64 encoded authentication tag
  algorithm: string;
}

export class EncryptionMetadata {
  private readonly _encryptedKey: string;
  private readonly _iv: string;
  private readonly _authTag: string;
  private readonly _algorithm: string;

  private constructor(props: EncryptionMetadataProps) {
    this._encryptedKey = props.encryptedKey;
    this._iv = props.iv;
    this._authTag = props.authTag;
    this._algorithm = props.algorithm;
  }

  static create(props: EncryptionMetadataProps): EncryptionMetadata {
    const requiredFields = [
      { value: props.encryptedKey, name: 'Encrypted key' },
      { value: props.iv, name: 'IV' },
      { value: props.authTag, name: 'Auth tag' },
      { value: props.algorithm, name: 'Algorithm' },
    ] as const;

    for (const field of requiredFields) {
      if (!field.value) {
        throw new Error(`${field.name} is required`);
      }
    }

    return new EncryptionMetadata(props);
  }

  get encryptedKey(): string {
    return this._encryptedKey;
  }

  get iv(): string {
    return this._iv;
  }

  get authTag(): string {
    return this._authTag;
  }

  get algorithm(): string {
    return this._algorithm;
  }

  toJSON(): EncryptionMetadataProps {
    return {
      encryptedKey: this._encryptedKey,
      iv: this._iv,
      authTag: this._authTag,
      algorithm: this._algorithm,
    };
  }
}
