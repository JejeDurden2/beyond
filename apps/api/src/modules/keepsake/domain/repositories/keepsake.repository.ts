import { Keepsake } from '../entities/keepsake.entity';

export const KEEPSAKE_REPOSITORY = 'KeepsakeRepository';

export interface KeepsakeRepository {
  findById(id: string): Promise<Keepsake | null>;
  findByVaultId(vaultId: string): Promise<Keepsake[]>;
  save(keepsake: Keepsake): Promise<void>;
  delete(id: string): Promise<void>;
}
