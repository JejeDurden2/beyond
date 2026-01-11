import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SECURE_FILE_REPOSITORY, SecureFileRepository } from '../../domain/repositories';
import { FILE_STORAGE_PORT, FileStoragePort } from '../ports';

export interface DeleteSecureFileInput {
  fileId: string;
  userId: string;
}

@Injectable()
export class DeleteSecureFileCommand {
  constructor(
    @Inject(SECURE_FILE_REPOSITORY)
    private readonly repository: SecureFileRepository,
    @Inject(FILE_STORAGE_PORT)
    private readonly storage: FileStoragePort,
  ) {}

  async execute(input: DeleteSecureFileInput): Promise<void> {
    const file = await this.repository.findById(input.fileId);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (!file.isOwnedBy(input.userId)) {
      throw new ForbiddenException('You do not have permission to delete this file');
    }

    await this.storage.delete(file.storageKey);
    await this.repository.delete(file.id);
  }
}
