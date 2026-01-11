import { SecureFile } from '../entities';

export const SECURE_FILE_REPOSITORY = Symbol('SECURE_FILE_REPOSITORY');

export interface SecureFileRepository {
  save(file: SecureFile): Promise<void>;
  findById(id: string): Promise<SecureFile | null>;
  findByOwnerId(ownerId: string): Promise<SecureFile[]>;
  delete(id: string): Promise<void>;
  deleteByOwnerId(ownerId: string): Promise<void>;
}
