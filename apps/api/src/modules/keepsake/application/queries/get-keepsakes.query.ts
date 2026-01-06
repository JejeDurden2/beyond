import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
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

export interface GetKeepsakesInput {
  userId: string;
  status?: KeepsakeStatus;
}

export interface KeepsakeSummary {
  id: string;
  type: KeepsakeType;
  title: string;
  status: KeepsakeStatus;
  triggerCondition: TriggerCondition;
  revealDelay: number | null;
  revealDate: Date | null;
  scheduledAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetKeepsakesOutput {
  keepsakes: KeepsakeSummary[];
}

@Injectable()
export class GetKeepsakesQuery {
  constructor(
    @Inject(KEEPSAKE_REPOSITORY)
    private readonly keepsakeRepository: KeepsakeRepository,
    @Inject('VaultRepository')
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(input: GetKeepsakesInput): Promise<GetKeepsakesOutput> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      throw new ForbiddenException('User does not have a vault');
    }

    const keepsakes = await this.keepsakeRepository.findByVaultId(vault.id, {
      status: input.status,
    });

    return {
      keepsakes: keepsakes.map((keepsake) => ({
        id: keepsake.id,
        type: keepsake.type,
        title: keepsake.title,
        status: keepsake.status,
        triggerCondition: keepsake.triggerCondition,
        revealDelay: keepsake.revealDelay,
        revealDate: keepsake.revealDate,
        scheduledAt: keepsake.scheduledAt,
        deliveredAt: keepsake.deliveredAt,
        createdAt: keepsake.createdAt,
        updatedAt: keepsake.updatedAt,
      })),
    };
  }
}
