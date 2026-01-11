import { Module } from '@nestjs/common';
import { KeepsakeAssignmentController } from './infrastructure/controllers/keepsake-assignment.controller';
import { PrismaKeepsakeAssignmentRepository } from './infrastructure/adapters/prisma-keepsake-assignment.repository';
import { BulkAssignCommand } from './application/commands/bulk-assign.command';
import { UpdatePersonalMessageCommand } from './application/commands/update-personal-message.command';
import { GetKeepsakeAssignmentsQuery } from './application/queries/get-keepsake-assignments.query';
import { GetBeneficiaryKeepsakesQuery } from './application/queries/get-beneficiary-keepsakes.query';
import { KEEPSAKE_ASSIGNMENT_REPOSITORY } from './domain/repositories/keepsake-assignment.repository';
import { VaultModule } from '../vault/vault.module';
import { KeepsakeModule } from '../keepsake/keepsake.module';
import { BeneficiaryModule } from '../beneficiary/beneficiary.module';

@Module({
  imports: [VaultModule, KeepsakeModule, BeneficiaryModule],
  controllers: [KeepsakeAssignmentController],
  providers: [
    {
      provide: KEEPSAKE_ASSIGNMENT_REPOSITORY,
      useClass: PrismaKeepsakeAssignmentRepository,
    },
    BulkAssignCommand,
    UpdatePersonalMessageCommand,
    GetKeepsakeAssignmentsQuery,
    GetBeneficiaryKeepsakesQuery,
  ],
  exports: [KEEPSAKE_ASSIGNMENT_REPOSITORY, GetBeneficiaryKeepsakesQuery],
})
export class KeepsakeAssignmentModule {}
