import { NotificationConfig } from '../entities/notification-config.entity';

export interface INotificationConfigRepository {
  save(config: NotificationConfig): Promise<void>;
  findById(id: string): Promise<NotificationConfig | null>;
  findByVaultId(vaultId: string): Promise<NotificationConfig | null>;
  delete(id: string): Promise<void>;
}

export const NOTIFICATION_CONFIG_REPOSITORY = Symbol('NOTIFICATION_CONFIG_REPOSITORY');
