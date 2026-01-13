import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NOTIFICATION_QUEUE } from '@/shared/queue/queue.constants';
import { NotificationOrchestratorService } from './application/services/notification-orchestrator.service';
import { KeepsakeDeliveredHandler } from './application/handlers/keepsake-delivered.handler';
import { NotificationProcessor } from './infrastructure/processors/notification.processor';
import { NOTIFICATION_CONFIG_REPOSITORY } from './domain/repositories/notification-config.repository';
import { PrismaNotificationConfigRepository } from './infrastructure/adapters/prisma-notification-config.repository';
import { NOTIFICATION_LOG_REPOSITORY } from './domain/repositories/notification-log.repository';
import { PrismaNotificationLogRepository } from './infrastructure/adapters/prisma-notification-log.repository';
import { EMAIL_SERVICE } from '@/shared/ports/email.port';
import { ConsoleEmailAdapter } from '@/shared/adapters/console-email.adapter';
import { BeneficiaryModule } from '@/modules/beneficiary/beneficiary.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { VaultModule } from '@/modules/vault/vault.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
    }),
    BeneficiaryModule,
    AuthModule,
    VaultModule,
  ],
  providers: [
    {
      provide: NOTIFICATION_CONFIG_REPOSITORY,
      useClass: PrismaNotificationConfigRepository,
    },
    {
      provide: NOTIFICATION_LOG_REPOSITORY,
      useClass: PrismaNotificationLogRepository,
    },
    {
      provide: EMAIL_SERVICE,
      useClass: ConsoleEmailAdapter,
    },
    NotificationOrchestratorService,
    KeepsakeDeliveredHandler,
    NotificationProcessor,
  ],
  exports: [
    NOTIFICATION_CONFIG_REPOSITORY,
    NOTIFICATION_LOG_REPOSITORY,
    NotificationOrchestratorService,
    KeepsakeDeliveredHandler,
  ],
})
export class NotificationModule {}
