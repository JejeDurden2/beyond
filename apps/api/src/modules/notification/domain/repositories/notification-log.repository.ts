import { NotificationLog } from '../entities/notification-log.entity';

export interface INotificationLogRepository {
  save(log: NotificationLog): Promise<void>;
  findById(id: string): Promise<NotificationLog | null>;
  findByKeepsakeId(keepsakeId: string): Promise<NotificationLog[]>;
  findPendingNotifications(limit?: number): Promise<NotificationLog[]>;
  findScheduledNotificationsDue(now: Date, limit?: number): Promise<NotificationLog[]>;
  findFailedNotifications(limit?: number): Promise<NotificationLog[]>;
  findPendingByBeneficiaryAndVault(
    beneficiaryId: string,
    vaultId: string,
  ): Promise<NotificationLog | null>;
  delete(id: string): Promise<void>;
}

export const NOTIFICATION_LOG_REPOSITORY = Symbol('NOTIFICATION_LOG_REPOSITORY');
