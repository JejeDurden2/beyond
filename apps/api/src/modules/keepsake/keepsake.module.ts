import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { KeepsakeController } from './infrastructure/controllers/keepsake.controller';
import { PrismaKeepsakeRepository } from './infrastructure/adapters/prisma-keepsake.repository';
import { PrismaKeepsakeMediaRepository } from './infrastructure/adapters/prisma-keepsake-media.repository';
import { R2StorageAdapter } from './infrastructure/adapters/r2-storage.adapter';
import { CreateKeepsakeCommand } from './application/commands/create-keepsake.command';
import { UpdateKeepsakeCommand } from './application/commands/update-keepsake.command';
import { DeleteKeepsakeCommand } from './application/commands/delete-keepsake.command';
import { DeliverKeepsakeCommand } from './application/commands/deliver-keepsake.command';
import { GetKeepsakesQuery } from './application/queries/get-keepsakes.query';
import { GetKeepsakeQuery } from './application/queries/get-keepsake.query';
import { DateTriggerScheduler } from './infrastructure/schedulers/date-trigger.scheduler';
import { DeathDeclaredHandler } from './application/handlers/death-declared.handler';
import { KeepsakeDeliveredHandler } from '@/modules/notification/application/handlers/keepsake-delivered.handler';
import {
  KEEPSAKE_REPOSITORY,
  KEEPSAKE_MEDIA_REPOSITORY,
} from './domain/repositories/keepsake.repository';
import { STORAGE_SERVICE } from './application/ports/storage.port';
import { VaultModule } from '../vault/vault.module';
import { DomainEventPublisher } from '@/shared/domain/domain-event-publisher.service';
import { KeepsakeDeliveredEvent } from './domain/events';
import { DeathDeclaredEvent } from '@/modules/vault/domain/events/death-declared.event';
import { NotificationModule } from '@/modules/notification/notification.module';

@Module({
  imports: [
    forwardRef(() => VaultModule),
    ScheduleModule.forRoot(),
    forwardRef(() => NotificationModule),
  ],
  controllers: [KeepsakeController],
  providers: [
    {
      provide: KEEPSAKE_REPOSITORY,
      useClass: PrismaKeepsakeRepository,
    },
    {
      provide: KEEPSAKE_MEDIA_REPOSITORY,
      useClass: PrismaKeepsakeMediaRepository,
    },
    {
      provide: STORAGE_SERVICE,
      useClass: R2StorageAdapter,
    },
    CreateKeepsakeCommand,
    UpdateKeepsakeCommand,
    DeleteKeepsakeCommand,
    DeliverKeepsakeCommand,
    GetKeepsakesQuery,
    GetKeepsakeQuery,
    DateTriggerScheduler,
    DeathDeclaredHandler,
  ],
  exports: [KEEPSAKE_REPOSITORY, KEEPSAKE_MEDIA_REPOSITORY, STORAGE_SERVICE, DeathDeclaredHandler],
})
export class KeepsakeModule implements OnModuleInit {
  constructor(
    private readonly eventPublisher: DomainEventPublisher,
    private readonly deathDeclaredHandler: DeathDeclaredHandler,
    private readonly keepsakeDeliveredHandler: KeepsakeDeliveredHandler,
  ) {}

  onModuleInit() {
    // Register event handlers
    this.eventPublisher.register(KeepsakeDeliveredEvent.name, KeepsakeDeliveredHandler);
    this.eventPublisher.register(DeathDeclaredEvent.name, DeathDeclaredHandler);
  }
}
