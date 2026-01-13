import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { INotificationConfigRepository } from '../../domain/repositories/notification-config.repository';
import { NotificationConfig } from '../../domain/entities/notification-config.entity';

interface PrismaNotificationConfigRecord {
  id: string;
  vaultId: string;
  trustedPersonDelayHours: number;
  beneficiaryDelayHours: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PrismaNotificationConfigRepository implements INotificationConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(config: NotificationConfig): Promise<void> {
    await this.prisma.notificationConfig.upsert({
      where: { id: config.id },
      create: {
        id: config.id,
        vaultId: config.vaultId,
        trustedPersonDelayHours: config.trustedPersonDelayHours,
        beneficiaryDelayHours: config.beneficiaryDelayHours,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
      update: {
        trustedPersonDelayHours: config.trustedPersonDelayHours,
        beneficiaryDelayHours: config.beneficiaryDelayHours,
        updatedAt: config.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<NotificationConfig | null> {
    const record = await this.prisma.notificationConfig.findUnique({
      where: { id },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByVaultId(vaultId: string): Promise<NotificationConfig | null> {
    const record = await this.prisma.notificationConfig.findUnique({
      where: { vaultId },
    });

    return record ? this.toDomain(record) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notificationConfig.delete({
      where: { id },
    });
  }

  private toDomain(record: PrismaNotificationConfigRecord): NotificationConfig {
    return NotificationConfig.reconstitute({
      id: record.id,
      vaultId: record.vaultId,
      trustedPersonDelayHours: record.trustedPersonDelayHours,
      beneficiaryDelayHours: record.beneficiaryDelayHours,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
