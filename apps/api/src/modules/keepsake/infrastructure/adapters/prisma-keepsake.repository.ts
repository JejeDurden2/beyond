import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { BaseRepository } from '@/shared/infrastructure/base-repository';
import { DomainEventPublisher } from '@/shared/domain/domain-event-publisher.service';
import { KeepsakeRepository, KeepsakeFilters } from '../../domain/repositories/keepsake.repository';
import { Keepsake, KeepsakeStatus, TriggerCondition } from '../../domain/entities/keepsake.entity';
import { KeepsakeMapper } from '../mappers/keepsake.mapper';
import {
  KeepsakeStatus as PrismaKeepsakeStatus,
  TriggerCondition as PrismaTriggerCondition,
  Prisma,
} from '@prisma/client';

const statusToPrisma: Record<KeepsakeStatus, PrismaKeepsakeStatus> = {
  [KeepsakeStatus.DRAFT]: 'draft',
  [KeepsakeStatus.SCHEDULED]: 'scheduled',
  [KeepsakeStatus.DELIVERED]: 'delivered',
};

const triggerToPrisma: Record<TriggerCondition, PrismaTriggerCondition> = {
  [TriggerCondition.ON_DEATH]: 'on_death',
  [TriggerCondition.ON_DATE]: 'on_date',
  [TriggerCondition.MANUAL]: 'manual',
};

@Injectable()
export class PrismaKeepsakeRepository
  extends BaseRepository<Keepsake>
  implements KeepsakeRepository
{
  constructor(
    private readonly prisma: PrismaService,
    eventPublisher: DomainEventPublisher,
  ) {
    super(eventPublisher);
  }

  async findById(id: string): Promise<Keepsake | null> {
    const record = await this.prisma.keepsake.findUnique({
      where: { id, deletedAt: null },
    });

    if (!record) return null;

    return KeepsakeMapper.toDomain(record);
  }

  async findByVaultId(vaultId: string, filters?: KeepsakeFilters): Promise<Keepsake[]> {
    const where: Prisma.KeepsakeWhereInput = {
      vaultId,
    };

    if (!filters?.includeDeleted) {
      where.deletedAt = null;
    }

    if (filters?.status) {
      where.status = statusToPrisma[filters.status];
    }

    const records = await this.prisma.keepsake.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => KeepsakeMapper.toDomain(record));
  }

  async findScheduledByTriggerAndDate(
    trigger: TriggerCondition,
    beforeDate: Date,
  ): Promise<Keepsake[]> {
    const records = await this.prisma.keepsake.findMany({
      where: {
        status: 'scheduled',
        triggerCondition: triggerToPrisma[trigger],
        scheduledAt: {
          lte: beforeDate,
        },
        deletedAt: null,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return records.map((record) => KeepsakeMapper.toDomain(record));
  }

  async save(keepsake: Keepsake): Promise<void> {
    const data = KeepsakeMapper.toPersistence(keepsake);

    await this.prisma.keepsake.upsert({
      where: { id: keepsake.id },
      create: data,
      update: data,
    });

    // Publish domain events after successful save
    await this.publishEvents(keepsake);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.keepsake.delete({
      where: { id },
    });
  }
}
