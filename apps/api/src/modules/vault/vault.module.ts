import { Module } from '@nestjs/common';
import { VaultController } from './infrastructure/controllers/vault.controller';
import { PrismaVaultRepository } from './infrastructure/adapters/prisma-vault.repository';
import { CreateVaultHandler } from './application/commands/create-vault.handler';
import { GetVaultHandler } from './application/queries/get-vault.handler';
import { VAULT_REPOSITORY } from './domain/repositories/vault.repository';

@Module({
  controllers: [VaultController],
  providers: [
    {
      provide: VAULT_REPOSITORY,
      useClass: PrismaVaultRepository,
    },
    CreateVaultHandler,
    GetVaultHandler,
  ],
  exports: [VAULT_REPOSITORY, CreateVaultHandler],
})
export class VaultModule {}
