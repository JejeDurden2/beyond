import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { VaultRepository } from '@/modules/vault/domain/repositories/vault.repository';
import {
  KeepsakeRepository,
  KEEPSAKE_REPOSITORY,
} from '../../domain/repositories/keepsake.repository';
import {
  KeepsakeType,
  KeepsakeStatus,
  TriggerCondition,
} from '../../domain/entities/keepsake.entity';
import { createHash } from 'crypto';

export interface UpdateKeepsakeInput {
  userId: string;
  keepsakeId: string;
  title?: string;
  content?: string;
  triggerCondition?: TriggerCondition;
  revealDelay?: number | null;
  revealDate?: Date | null;
  scheduledAt?: Date | null;
}

export interface UpdateKeepsakeOutput {
  id: string;
  type: KeepsakeType;
  title: string;
  status: KeepsakeStatus;
  triggerCondition: TriggerCondition;
  revealDelay: number | null;
  revealDate: Date | null;
  scheduledAt: Date | null;
  updatedAt: Date;
}

@Injectable()
export class UpdateKeepsakeCommand {
  constructor(
    @Inject(KEEPSAKE_REPOSITORY)
    private readonly keepsakeRepository: KeepsakeRepository,
    @Inject('VaultRepository')
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(input: UpdateKeepsakeInput): Promise<UpdateKeepsakeOutput> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      throw new ForbiddenException('User does not have a vault');
    }

    const keepsake = await this.keepsakeRepository.findById(input.keepsakeId);
    if (!keepsake) {
      throw new NotFoundException('Keepsake not found');
    }

    if (keepsake.vaultId !== vault.id) {
      throw new ForbiddenException('Not authorized to update this keepsake');
    }

    const encryptionKey = input.content
      ? this.deriveEncryptionKey(vault.encryptionSalt.value)
      : undefined;

    const updateResult = keepsake.update({
      title: input.title,
      content: input.content,
      encryptionKey,
      triggerCondition: input.triggerCondition,
      revealDelay: input.revealDelay,
      revealDate: input.revealDate,
      scheduledAt: input.scheduledAt,
    });

    if (updateResult.isErr()) {
      throw new BadRequestException(updateResult.error);
    }

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
      updatedAt: keepsake.updatedAt,
    };
  }

  private deriveEncryptionKey(salt: string): Buffer {
    return createHash('sha256').update(salt).digest();
  }
}
