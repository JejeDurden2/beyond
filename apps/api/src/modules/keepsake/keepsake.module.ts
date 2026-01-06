import { Module } from '@nestjs/common';
import { KeepsakeController } from './infrastructure/controllers/keepsake.controller';
import { PrismaKeepsakeRepository } from './infrastructure/adapters/prisma-keepsake.repository';
import { PrismaKeepsakeMediaRepository } from './infrastructure/adapters/prisma-keepsake-media.repository';
import { R2StorageAdapter } from './infrastructure/adapters/r2-storage.adapter';
import { CreateKeepsakeCommand } from './application/commands/create-keepsake.command';
import { UpdateKeepsakeCommand } from './application/commands/update-keepsake.command';
import { DeleteKeepsakeCommand } from './application/commands/delete-keepsake.command';
import { GetKeepsakesQuery } from './application/queries/get-keepsakes.query';
import { GetKeepsakeQuery } from './application/queries/get-keepsake.query';
import {
  KEEPSAKE_REPOSITORY,
  KEEPSAKE_MEDIA_REPOSITORY,
} from './domain/repositories/keepsake.repository';
import { STORAGE_SERVICE } from './application/ports/storage.port';
import { VaultModule } from '../vault/vault.module';

@Module({
  imports: [VaultModule],
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
    GetKeepsakesQuery,
    GetKeepsakeQuery,
  ],
  exports: [KEEPSAKE_REPOSITORY, KEEPSAKE_MEDIA_REPOSITORY, STORAGE_SERVICE],
})
export class KeepsakeModule {}
