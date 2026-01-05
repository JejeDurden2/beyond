import { Module } from '@nestjs/common';
import { KeepsakeController } from './infrastructure/controllers/keepsake.controller';
import { PrismaKeepsakeRepository } from './infrastructure/adapters/prisma-keepsake.repository';
import { CreateKeepsakeCommand } from './application/commands/create-keepsake.command';
import { UpdateKeepsakeCommand } from './application/commands/update-keepsake.command';
import { DeleteKeepsakeCommand } from './application/commands/delete-keepsake.command';
import { GetKeepsakesQuery } from './application/queries/get-keepsakes.query';
import { GetKeepsakeQuery } from './application/queries/get-keepsake.query';
import { KEEPSAKE_REPOSITORY } from './domain/repositories/keepsake.repository';
import { VaultModule } from '../vault/vault.module';

@Module({
  imports: [VaultModule],
  controllers: [KeepsakeController],
  providers: [
    {
      provide: KEEPSAKE_REPOSITORY,
      useClass: PrismaKeepsakeRepository,
    },
    CreateKeepsakeCommand,
    UpdateKeepsakeCommand,
    DeleteKeepsakeCommand,
    GetKeepsakesQuery,
    GetKeepsakeQuery,
  ],
  exports: [KEEPSAKE_REPOSITORY],
})
export class KeepsakeModule {}
