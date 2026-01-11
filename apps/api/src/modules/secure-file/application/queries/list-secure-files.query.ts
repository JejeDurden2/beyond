import { Injectable, Inject } from '@nestjs/common';
import { SecureFile } from '../../domain';
import { SECURE_FILE_REPOSITORY, SecureFileRepository } from '../../domain/repositories';

export interface ListSecureFilesInput {
  userId: string;
}

export interface SecureFileDto {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

export interface ListSecureFilesOutput {
  files: SecureFileDto[];
}

function toSecureFileDto(file: SecureFile): SecureFileDto {
  return {
    id: file.id,
    filename: file.filename,
    mimeType: file.mimeType,
    size: file.size,
    createdAt: file.createdAt,
  };
}

@Injectable()
export class ListSecureFilesQuery {
  constructor(
    @Inject(SECURE_FILE_REPOSITORY)
    private readonly repository: SecureFileRepository,
  ) {}

  async execute(input: ListSecureFilesInput): Promise<ListSecureFilesOutput> {
    const files = await this.repository.findByOwnerId(input.userId);

    return { files: files.map(toSecureFileDto) };
  }
}
