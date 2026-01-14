import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
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
import { ResendEmailAdapter } from '@/shared/adapters/resend-email.adapter';
import { BeneficiaryModule } from '@/modules/beneficiary/beneficiary.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { VaultModule } from '@/modules/vault/vault.module';
import { KeepsakeAssignmentModule } from '@/modules/keepsake-assignment/keepsake-assignment.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
    }),
    forwardRef(() => BeneficiaryModule),
    forwardRef(() => AuthModule),
    forwardRef(() => VaultModule),
    forwardRef(() => KeepsakeAssignmentModule),
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
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV');
        const resendApiKey = configService.get<string>('RESEND_API_KEY');

        // Use Resend in production or if RESEND_API_KEY is set
        if (nodeEnv === 'production' || resendApiKey) {
          return new ResendEmailAdapter(configService);
        }

        // Default to console adapter for development
        return new ConsoleEmailAdapter(configService);
      },
      inject: [ConfigService],
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
