export type VaultStatus = 'active' | 'pending_verification' | 'unsealed';

export interface Vault {
  id: string;
  status: VaultStatus;
  encryptionSalt: string;
  unsealedAt: string | null;
  createdAt: string;
}

export interface CreateVaultResponse {
  id: string;
  encryptionSalt: string;
}
