import { Injectable, Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { VaultRepository, VAULT_REPOSITORY } from '../../domain/repositories/vault.repository';
import { Vault } from '../../domain/entities/vault.entity';

export interface CreateVaultCommand {
  userId: string;
}

export interface CreateVaultResult {
  id: string;
  encryptionSalt: string;
}

@Injectable()
export class CreateVaultHandler {
  constructor(
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(command: CreateVaultCommand): Promise<CreateVaultResult> {
    const existingVault = await this.vaultRepository.findByUserId(command.userId);
    if (existingVault) {
      throw new ConflictException('User already has a vault');
    }

    const vaultResult = Vault.create({ userId: command.userId });

    if (vaultResult.isErr()) {
      throw new BadRequestException(vaultResult.error);
    }

    const vault = vaultResult.value;
    await this.vaultRepository.save(vault);

    return {
      id: vault.id,
      encryptionSalt: vault.encryptionSalt.value,
    };
  }
}
