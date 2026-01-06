import { Module } from '@nestjs/common';
import { BeneficiaryController } from './infrastructure/controllers/beneficiary.controller';
import { PrismaBeneficiaryRepository } from './infrastructure/adapters/prisma-beneficiary.repository';
import { CreateBeneficiaryCommand } from './application/commands/create-beneficiary.command';
import { UpdateBeneficiaryCommand } from './application/commands/update-beneficiary.command';
import { DeleteBeneficiaryCommand } from './application/commands/delete-beneficiary.command';
import { ListBeneficiariesQuery } from './application/queries/list-beneficiaries.query';
import { GetBeneficiaryQuery } from './application/queries/get-beneficiary.query';
import { VaultModule } from '../vault/vault.module';

@Module({
  imports: [VaultModule],
  controllers: [BeneficiaryController],
  providers: [
    {
      provide: 'BeneficiaryRepository',
      useClass: PrismaBeneficiaryRepository,
    },
    CreateBeneficiaryCommand,
    UpdateBeneficiaryCommand,
    DeleteBeneficiaryCommand,
    ListBeneficiariesQuery,
    GetBeneficiaryQuery,
  ],
  exports: ['BeneficiaryRepository'],
})
export class BeneficiaryModule {}
