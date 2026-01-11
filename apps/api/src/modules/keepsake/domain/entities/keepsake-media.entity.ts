import { Entity } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB (reduced from 20MB per user requirement)

export interface KeepsakeMediaProps {
  id?: string;
  keepsakeId: string;
  type: MediaType;
  key: string;
  filename: string;
  mimeType: string;
  size: number;
  order: number;
  createdAt?: Date;
}

export interface CreateKeepsakeMediaInput {
  keepsakeId: string;
  key: string;
  filename: string;
  mimeType: string;
  size: number;
  order?: number;
}

export class KeepsakeMedia extends Entity<KeepsakeMediaProps> {
  private constructor(props: KeepsakeMediaProps) {
    super(props);
  }

  static create(input: CreateKeepsakeMediaInput): Result<KeepsakeMedia, string> {
    if (!input.keepsakeId) {
      return err('Keepsake ID is required');
    }

    if (!input.key) {
      return err('Media key is required');
    }

    if (!input.filename) {
      return err('Filename is required');
    }

    const mediaTypeResult = this.determineMediaType(input.mimeType);
    if (mediaTypeResult.isErr()) {
      return err(mediaTypeResult.error);
    }

    const validationResult = this.validateFile(mediaTypeResult.value, input.mimeType, input.size);
    if (validationResult.isErr()) {
      return err(validationResult.error);
    }

    return ok(
      new KeepsakeMedia({
        keepsakeId: input.keepsakeId,
        type: mediaTypeResult.value,
        key: input.key,
        filename: input.filename,
        mimeType: input.mimeType,
        size: input.size,
        order: input.order ?? 0,
      }),
    );
  }

  static reconstitute(props: KeepsakeMediaProps): KeepsakeMedia {
    return new KeepsakeMedia(props);
  }

  private static determineMediaType(mimeType: string): Result<MediaType, string> {
    if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return ok(MediaType.IMAGE);
    }
    if (ALLOWED_VIDEO_TYPES.includes(mimeType)) {
      return ok(MediaType.VIDEO);
    }
    if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
      return ok(MediaType.DOCUMENT);
    }
    return err(`Unsupported file type: ${mimeType}`);
  }

  private static validateFile(
    type: MediaType,
    mimeType: string,
    size: number,
  ): Result<void, string> {
    let maxSize: number;
    let allowedTypes: string[];

    switch (type) {
      case MediaType.IMAGE:
        maxSize = MAX_IMAGE_SIZE;
        allowedTypes = ALLOWED_IMAGE_TYPES;
        break;
      case MediaType.VIDEO:
        maxSize = MAX_VIDEO_SIZE;
        allowedTypes = ALLOWED_VIDEO_TYPES;
        break;
      case MediaType.DOCUMENT:
        maxSize = MAX_DOCUMENT_SIZE;
        allowedTypes = ALLOWED_DOCUMENT_TYPES;
        break;
    }

    if (!allowedTypes.includes(mimeType)) {
      return err(`Invalid file type for ${type}: ${mimeType}`);
    }

    if (size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return err(`File size exceeds maximum of ${maxSizeMB}MB for ${type}`);
    }

    if (size <= 0) {
      return err('File size must be greater than 0');
    }

    return ok(undefined);
  }

  static getAllowedMimeTypes(): string[] {
    return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES];
  }

  static getMaxFileSize(type: MediaType): number {
    switch (type) {
      case MediaType.IMAGE:
        return MAX_IMAGE_SIZE;
      case MediaType.VIDEO:
        return MAX_VIDEO_SIZE;
      case MediaType.DOCUMENT:
        return MAX_DOCUMENT_SIZE;
    }
  }

  updateOrder(order: number): void {
    this.props.order = order;
  }

  get keepsakeId(): string {
    return this.props.keepsakeId;
  }

  get type(): MediaType {
    return this.props.type;
  }

  get key(): string {
    return this.props.key;
  }

  get filename(): string {
    return this.props.filename;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get size(): number {
    return this.props.size;
  }

  get order(): number {
    return this.props.order;
  }

  get isImage(): boolean {
    return this.props.type === MediaType.IMAGE;
  }

  get isVideo(): boolean {
    return this.props.type === MediaType.VIDEO;
  }

  get isDocument(): boolean {
    return this.props.type === MediaType.DOCUMENT;
  }
}
