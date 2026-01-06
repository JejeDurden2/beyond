import { Keepsake, KeepsakeStatus } from '../entities/keepsake.entity';
import { KeepsakeMedia } from '../entities/keepsake-media.entity';

export const KEEPSAKE_REPOSITORY = 'KeepsakeRepository';
export const KEEPSAKE_MEDIA_REPOSITORY = 'KeepsakeMediaRepository';

export interface KeepsakeFilters {
  status?: KeepsakeStatus;
  includeDeleted?: boolean;
}

export interface KeepsakeRepository {
  findById(id: string): Promise<Keepsake | null>;
  findByVaultId(vaultId: string, filters?: KeepsakeFilters): Promise<Keepsake[]>;
  save(keepsake: Keepsake): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface KeepsakeMediaRepository {
  findById(id: string): Promise<KeepsakeMedia | null>;
  findByKeepsakeId(keepsakeId: string): Promise<KeepsakeMedia[]>;
  findByKey(key: string): Promise<KeepsakeMedia | null>;
  save(media: KeepsakeMedia): Promise<void>;
  saveMany(media: KeepsakeMedia[]): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByKeepsakeId(keepsakeId: string): Promise<void>;
}
