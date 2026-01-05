import { Module } from '@nestjs/common';
import { VaultController } from './infrastructure/controllers/vault.controller';
import { PrismaVaultRepository } from './infrastructure/adapters/prisma-vault.repository';
import { CreateVaultHandler } from './application/commands/create-vault.handler';
import { GetVaultHandler } from './application/queries/get-vault.handler';

@Module({
  controllers: [VaultController],
  providers: [
    {
      provide: 'VaultRepository',
      useClass: PrismaVaultRepository,
    },
    CreateVaultHandler,
    GetVaultHandler,
  ],
  exports: ['VaultRepository', CreateVaultHandler],
})
export class VaultModule {}
