import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { INotificationLogRepository } from '../../domain/repositories/notification-log.repository';
import {
  NotificationLog,
  NotificationType,
  NotificationStatus,
} from '../../domain/entities/notification-log.entity';

interface PrismaNotificationLogRecord {
  id: string;
  keepsakeId: string;
  beneficiaryId: string | null;
  type: string;
  status: string;
  scheduledFor: Date;
  sentAt: Date | null;
  failureReason: string | null;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PrismaNotificationLogRepository implements INotificationLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(log: NotificationLog): Promise<void> {
    await this.prisma.notificationLog.upsert({
      where: { id: log.id },
      create: {
        id: log.id,
        keepsakeId: log.keepsakeId,
        beneficiaryId: log.beneficiaryId,
        type: log.type,
        status: log.status,
        scheduledFor: log.scheduledFor,
        sentAt: log.sentAt,
        failureReason: log.failureReason,
        retryCount: log.retryCount,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
      },
      update: {
        status: log.status,
        sentAt: log.sentAt,
        failureReason: log.failureReason,
        retryCount: log.retryCount,
        updatedAt: log.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<NotificationLog | null> {
    const record = await this.prisma.notificationLog.findUnique({
      where: { id },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByKeepsakeId(keepsakeId: string): Promise<NotificationLog[]> {
    const records = await this.prisma.notificationLog.findMany({
      where: { keepsakeId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record: PrismaNotificationLogRecord) => this.toDomain(record));
  }

  async findPendingNotifications(limit = 100): Promise<NotificationLog[]> {
    const records = await this.prisma.notificationLog.findMany({
      where: {
        status: NotificationStatus.PENDING,
      },
      orderBy: { scheduledFor: 'asc' },
      take: limit,
    });

    return records.map((record: PrismaNotificationLogRecord) => this.toDomain(record));
  }

  async findScheduledNotificationsDue(now: Date, limit = 100): Promise<NotificationLog[]> {
    const records = await this.prisma.notificationLog.findMany({
      where: {
        status: NotificationStatus.SCHEDULED,
        scheduledFor: {
          lte: now,
        },
      },
      orderBy: { scheduledFor: 'asc' },
      take: limit,
    });

    return records.map((record: PrismaNotificationLogRecord) => this.toDomain(record));
  }

  async findFailedNotifications(limit = 100): Promise<NotificationLog[]> {
    const records = await this.prisma.notificationLog.findMany({
      where: {
        status: NotificationStatus.FAILED,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return records.map((record: PrismaNotificationLogRecord) => this.toDomain(record));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notificationLog.delete({
      where: { id },
    });
  }

  private toDomain(record: PrismaNotificationLogRecord): NotificationLog {
    return NotificationLog.reconstitute({
      id: record.id,
      keepsakeId: record.keepsakeId,
      beneficiaryId: record.beneficiaryId,
      type: record.type as NotificationType,
      status: record.status as NotificationStatus,
      scheduledFor: record.scheduledFor,
      sentAt: record.sentAt,
      failureReason: record.failureReason,
      retryCount: record.retryCount,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
