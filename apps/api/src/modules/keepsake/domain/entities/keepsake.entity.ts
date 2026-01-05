import { AggregateRoot } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';
import { EncryptedContent } from '../value-objects/encrypted-content.value-object';

export enum KeepsakeType {
  TEXT = 'text',
  LETTER = 'letter',
  PHOTO = 'photo',
  VIDEO = 'video',
  WISH = 'wish',
  SCHEDULED_ACTION = 'scheduled_action',
}

export interface KeepsakeProps {
  id?: string;
  vaultId: string;
  type: KeepsakeType;
  title: string;
  encryptedContent: EncryptedContent;
  revealDelay?: number | null;
  revealDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateKeepsakeInput {
  vaultId: string;
  type: KeepsakeType;
  title: string;
  content: string;
  encryptionKey: Buffer;
  revealDelay?: number;
  revealDate?: Date;
}

export interface UpdateKeepsakeInput {
  title?: string;
  content?: string;
  encryptionKey?: Buffer;
  revealDelay?: number | null;
  revealDate?: Date | null;
}

export class Keepsake extends AggregateRoot<KeepsakeProps> {
  private static readonly TITLE_MAX_LENGTH = 255;
  private static readonly TITLE_MIN_LENGTH = 1;

  private constructor(props: KeepsakeProps) {
    super(props);
  }

  static create(input: CreateKeepsakeInput): Result<Keepsake, string> {
    const titleValidation = this.validateTitle(input.title);
    if (titleValidation.isErr()) {
      return err(titleValidation.error);
    }

    if (!input.vaultId) {
      return err('Vault ID is required');
    }

    if (!Object.values(KeepsakeType).includes(input.type)) {
      return err('Invalid keepsake type');
    }

    const encryptionResult = EncryptedContent.encrypt(input.content, input.encryptionKey);
    if (encryptionResult.isErr()) {
      return err(encryptionResult.error);
    }

    return ok(
      new Keepsake({
        vaultId: input.vaultId,
        type: input.type,
        title: input.title.trim(),
        encryptedContent: encryptionResult.value,
        revealDelay: input.revealDelay ?? null,
        revealDate: input.revealDate ?? null,
      }),
    );
  }

  static reconstitute(props: KeepsakeProps): Keepsake {
    return new Keepsake(props);
  }

  private static validateTitle(title: string): Result<void, string> {
    if (!title || title.trim().length < this.TITLE_MIN_LENGTH) {
      return err(`Title must be at least ${this.TITLE_MIN_LENGTH} character`);
    }

    if (title.length > this.TITLE_MAX_LENGTH) {
      return err(`Title must not exceed ${this.TITLE_MAX_LENGTH} characters`);
    }

    return ok(undefined);
  }

  update(input: UpdateKeepsakeInput): Result<void, string> {
    if (input.title !== undefined) {
      const titleValidation = Keepsake.validateTitle(input.title);
      if (titleValidation.isErr()) {
        return err(titleValidation.error);
      }
      this.props.title = input.title.trim();
    }

    if (input.content !== undefined && input.encryptionKey) {
      const encryptionResult = EncryptedContent.encrypt(input.content, input.encryptionKey);
      if (encryptionResult.isErr()) {
        return err(encryptionResult.error);
      }
      this.props.encryptedContent = encryptionResult.value;
    }

    if (input.revealDelay !== undefined) {
      this.props.revealDelay = input.revealDelay;
    }

    if (input.revealDate !== undefined) {
      this.props.revealDate = input.revealDate;
    }

    this._updatedAt = new Date();
    return ok(undefined);
  }

  decryptContent(encryptionKey: Buffer): Result<string, string> {
    return this.props.encryptedContent.decrypt(encryptionKey);
  }

  get vaultId(): string {
    return this.props.vaultId;
  }

  get type(): KeepsakeType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get encryptedContent(): EncryptedContent {
    return this.props.encryptedContent;
  }

  get revealDelay(): number | null {
    return this.props.revealDelay ?? null;
  }

  get revealDate(): Date | null {
    return this.props.revealDate ?? null;
  }
}
