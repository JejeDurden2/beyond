import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { VaultRepository } from '../../domain/repositories/vault.repository';

export interface GetVaultQuery {
  userId: string;
}

export interface GetVaultResult {
  id: string;
  status: string;
  encryptionSalt: string;
  unsealedAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class GetVaultHandler {
  constructor(
    @Inject('VaultRepository')
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(query: GetVaultQuery): Promise<GetVaultResult> {
    const vault = await this.vaultRepository.findByUserId(query.userId);

    if (!vault) {
      throw new NotFoundException('Vault not found');
    }

    return {
      id: vault.id,
      status: vault.status,
      encryptionSalt: vault.encryptionSalt.value,
      unsealedAt: vault.unsealedAt,
      createdAt: vault.createdAt,
    };
  }
}
