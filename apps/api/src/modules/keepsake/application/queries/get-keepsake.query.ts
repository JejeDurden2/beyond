import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { VaultRepository } from '@/modules/vault/domain/repositories/vault.repository';
import {
  KeepsakeRepository,
  KEEPSAKE_REPOSITORY,
} from '../../domain/repositories/keepsake.repository';
import { KeepsakeType } from '../../domain/entities/keepsake.entity';
import { createHash } from 'crypto';

export interface GetKeepsakeInput {
  userId: string;
  keepsakeId: string;
}

export interface GetKeepsakeOutput {
  id: string;
  type: KeepsakeType;
  title: string;
  content: string;
  revealDelay: number | null;
  revealDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetKeepsakeQuery {
  constructor(
    @Inject(KEEPSAKE_REPOSITORY)
    private readonly keepsakeRepository: KeepsakeRepository,
    @Inject('VaultRepository')
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(input: GetKeepsakeInput): Promise<GetKeepsakeOutput> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      throw new ForbiddenException('User does not have a vault');
    }

    const keepsake = await this.keepsakeRepository.findById(input.keepsakeId);
    if (!keepsake) {
      throw new NotFoundException('Keepsake not found');
    }

    if (keepsake.vaultId !== vault.id) {
      throw new ForbiddenException('Not authorized to access this keepsake');
    }

    const encryptionKey = this.deriveEncryptionKey(vault.encryptionSalt.value);
    const decryptResult = keepsake.decryptContent(encryptionKey);

    if (decryptResult.isErr()) {
      throw new Error('Failed to decrypt content');
    }

    return {
      id: keepsake.id,
      type: keepsake.type,
      title: keepsake.title,
      content: decryptResult.value,
      revealDelay: keepsake.revealDelay,
      revealDate: keepsake.revealDate,
      createdAt: keepsake.createdAt,
      updatedAt: keepsake.updatedAt,
    };
  }

  private deriveEncryptionKey(salt: string): Buffer {
    return createHash('sha256').update(salt).digest();
  }
}
