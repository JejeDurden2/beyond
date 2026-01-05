import { Vault as PrismaVault, VaultStatus as PrismaVaultStatus } from '@prisma/client';
import { Vault, VaultStatus } from '../../domain/entities/vault.entity';
import { EncryptionSalt } from '../../domain/value-objects/encryption-salt.value-object';

export class VaultMapper {
  private static readonly statusToDomain: Record<PrismaVaultStatus, VaultStatus> = {
    active: VaultStatus.ACTIVE,
    pending_verification: VaultStatus.PENDING_VERIFICATION,
    unsealed: VaultStatus.UNSEALED,
  };

  private static readonly statusToPersistence: Record<VaultStatus, PrismaVaultStatus> = {
    [VaultStatus.ACTIVE]: 'active',
    [VaultStatus.PENDING_VERIFICATION]: 'pending_verification',
    [VaultStatus.UNSEALED]: 'unsealed',
  };

  static toDomain(raw: PrismaVault): Vault {
    const encryptionSalt = EncryptionSalt.fromString(raw.encryptionSalt);

    return Vault.reconstitute({
      id: raw.id,
      userId: raw.userId,
      status: this.statusToDomain[raw.status],
      encryptionSalt,
      unsealedAt: raw.unsealedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(vault: Vault): Omit<PrismaVault, 'createdAt' | 'updatedAt'> {
    return {
      id: vault.id,
      userId: vault.userId,
      status: this.statusToPersistence[vault.status],
      encryptionSalt: vault.encryptionSalt.value,
      unsealedAt: vault.unsealedAt,
    };
  }
}
