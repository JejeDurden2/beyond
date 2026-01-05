import { Vault } from '../entities/vault.entity';

export interface VaultRepository {
  findById(id: string): Promise<Vault | null>;
  findByUserId(userId: string): Promise<Vault | null>;
  save(vault: Vault): Promise<void>;
}

export const VAULT_REPOSITORY = Symbol('VaultRepository');
