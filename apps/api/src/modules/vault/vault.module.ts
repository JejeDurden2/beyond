import { Module, forwardRef } from '@nestjs/common';
import { VaultController } from './infrastructure/controllers/vault.controller';
import { PrismaVaultRepository } from './infrastructure/adapters/prisma-vault.repository';
import { CreateVaultHandler } from './application/commands/create-vault.handler';
import { DeclareDeathCommand } from './application/commands/declare-death.command';
import { GetVaultHandler } from './application/queries/get-vault.handler';
import { VAULT_REPOSITORY } from './domain/repositories/vault.repository';
import { BeneficiaryModule } from '../beneficiary/beneficiary.module';

@Module({
  imports: [forwardRef(() => BeneficiaryModule)],
  controllers: [VaultController],
  providers: [
    {
      provide: VAULT_REPOSITORY,
      useClass: PrismaVaultRepository,
    },
    CreateVaultHandler,
    DeclareDeathCommand,
    GetVaultHandler,
  ],
  exports: [VAULT_REPOSITORY, CreateVaultHandler, DeclareDeathCommand],
})
export class VaultModule {}
