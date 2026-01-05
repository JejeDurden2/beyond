import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { VaultRepository } from '@/modules/vault/domain/repositories/vault.repository';
import {
  KeepsakeRepository,
  KEEPSAKE_REPOSITORY,
} from '../../domain/repositories/keepsake.repository';

export interface DeleteKeepsakeInput {
  userId: string;
  keepsakeId: string;
}

@Injectable()
export class DeleteKeepsakeCommand {
  constructor(
    @Inject(KEEPSAKE_REPOSITORY)
    private readonly keepsakeRepository: KeepsakeRepository,
    @Inject('VaultRepository')
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(input: DeleteKeepsakeInput): Promise<void> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      throw new ForbiddenException('User does not have a vault');
    }

    const keepsake = await this.keepsakeRepository.findById(input.keepsakeId);
    if (!keepsake) {
      throw new NotFoundException('Keepsake not found');
    }

    if (keepsake.vaultId !== vault.id) {
      throw new ForbiddenException('Not authorized to delete this keepsake');
    }

    await this.keepsakeRepository.delete(input.keepsakeId);
  }
}
