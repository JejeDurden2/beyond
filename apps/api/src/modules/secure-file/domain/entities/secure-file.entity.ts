import { randomUUID } from 'crypto';
import { EncryptionMetadata } from '../value-objects';

export interface SecureFileProps {
  id: string;
  ownerId: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  encryptionMetadata: EncryptionMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSecureFileProps {
  ownerId: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  encryptionMetadata: EncryptionMetadata;
}

export class SecureFile {
  private readonly _id: string;
  private readonly _ownerId: string;
  private readonly _filename: string;
  private readonly _mimeType: string;
  private readonly _size: number;
  private readonly _storageKey: string;
  private readonly _encryptionMetadata: EncryptionMetadata;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: SecureFileProps) {
    this._id = props.id;
    this._ownerId = props.ownerId;
    this._filename = props.filename;
    this._mimeType = props.mimeType;
    this._size = props.size;
    this._storageKey = props.storageKey;
    this._encryptionMetadata = props.encryptionMetadata;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateSecureFileProps): SecureFile {
    const now = new Date();
    return new SecureFile({
      id: randomUUID(),
      ownerId: props.ownerId,
      filename: props.filename,
      mimeType: props.mimeType,
      size: props.size,
      storageKey: props.storageKey,
      encryptionMetadata: props.encryptionMetadata,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: SecureFileProps): SecureFile {
    return new SecureFile(props);
  }

  get id(): string {
    return this._id;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  get filename(): string {
    return this._filename;
  }

  get mimeType(): string {
    return this._mimeType;
  }

  get size(): number {
    return this._size;
  }

  get storageKey(): string {
    return this._storageKey;
  }

  get encryptionMetadata(): EncryptionMetadata {
    return this._encryptionMetadata;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  isOwnedBy(userId: string): boolean {
    return this._ownerId === userId;
  }
}
