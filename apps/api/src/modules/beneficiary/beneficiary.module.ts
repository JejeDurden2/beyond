import { Module, forwardRef } from '@nestjs/common';
import { BeneficiaryController } from './infrastructure/controllers/beneficiary.controller';
import { PrismaBeneficiaryRepository } from './infrastructure/adapters/prisma-beneficiary.repository';
import { CreateBeneficiaryCommand } from './application/commands/create-beneficiary.command';
import { UpdateBeneficiaryCommand } from './application/commands/update-beneficiary.command';
import { DeleteBeneficiaryCommand } from './application/commands/delete-beneficiary.command';
import { ListBeneficiariesQuery } from './application/queries/list-beneficiaries.query';
import { GetBeneficiaryQuery } from './application/queries/get-beneficiary.query';
import { BENEFICIARY_REPOSITORY } from './domain/repositories/beneficiary.repository';
import { VaultModule } from '../vault/vault.module';
import { KeepsakeAssignmentModule } from '../keepsake-assignment/keepsake-assignment.module';

@Module({
  imports: [VaultModule, forwardRef(() => KeepsakeAssignmentModule)],
  controllers: [BeneficiaryController],
  providers: [
    {
      provide: BENEFICIARY_REPOSITORY,
      useClass: PrismaBeneficiaryRepository,
    },
    CreateBeneficiaryCommand,
    UpdateBeneficiaryCommand,
    DeleteBeneficiaryCommand,
    ListBeneficiariesQuery,
    GetBeneficiaryQuery,
  ],
  exports: [BENEFICIARY_REPOSITORY],
})
export class BeneficiaryModule {}
