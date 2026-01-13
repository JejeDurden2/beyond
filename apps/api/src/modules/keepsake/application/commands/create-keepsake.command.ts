import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';
import {
  KeepsakeRepository,
  KEEPSAKE_REPOSITORY,
} from '../../domain/repositories/keepsake.repository';
import {
  Keepsake,
  KeepsakeType,
  KeepsakeStatus,
  TriggerCondition,
} from '../../domain/entities/keepsake.entity';
import { createHash } from 'crypto';

export interface CreateKeepsakeInput {
  userId: string;
  type: KeepsakeType;
  title: string;
  content: string;
  triggerCondition?: TriggerCondition;
  revealDelay?: number;
  revealDate?: Date;
  scheduledAt?: Date;
}

export interface CreateKeepsakeOutput {
  id: string;
  type: KeepsakeType;
  title: string;
  status: KeepsakeStatus;
  triggerCondition: TriggerCondition;
  revealDelay: number | null;
  revealDate: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class CreateKeepsakeCommand {
  constructor(
    @Inject(KEEPSAKE_REPOSITORY)
    private readonly keepsakeRepository: KeepsakeRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(input: CreateKeepsakeInput): Promise<CreateKeepsakeOutput> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      throw new ForbiddenException('User does not have a vault');
    }

    const encryptionKey = this.deriveEncryptionKey(vault.encryptionSalt.value);

    const keepsakeResult = Keepsake.create({
      vaultId: vault.id,
      type: input.type,
      title: input.title,
      content: input.content,
      encryptionKey,
      triggerCondition: input.triggerCondition,
      revealDelay: input.revealDelay,
      revealDate: input.revealDate,
      scheduledAt: input.scheduledAt,
    });

    if (keepsakeResult.isErr()) {
      throw new BadRequestException(keepsakeResult.error);
    }

    const keepsake = keepsakeResult.value;
    await this.keepsakeRepository.save(keepsake);

    return {
      id: keepsake.id,
      type: keepsake.type,
      title: keepsake.title,
      status: keepsake.status,
      triggerCondition: keepsake.triggerCondition,
      revealDelay: keepsake.revealDelay,
      revealDate: keepsake.revealDate,
      scheduledAt: keepsake.scheduledAt,
      createdAt: keepsake.createdAt,
    };
  }

  private deriveEncryptionKey(salt: string): Buffer {
    return createHash('sha256').update(salt).digest();
  }
}
