import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  KeepsakeAssignmentRepository,
  KEEPSAKE_ASSIGNMENT_REPOSITORY,
} from '../../domain/repositories/keepsake-assignment.repository';
import { VaultRepository } from '@/modules/vault/domain/repositories/vault.repository';
import {
  BENEFICIARY_REPOSITORY,
  BeneficiaryRepository,
} from '@/modules/beneficiary/domain/repositories/beneficiary.repository';

export interface GetBeneficiaryKeepsakesInput {
  userId: string;
  beneficiaryId: string;
}

export interface BeneficiaryKeepsakeItem {
  id: string;
  keepsakeId: string;
  keepsakeTitle: string;
  keepsakeType: string;
  keepsakeStatus: string;
  keepsakeUpdatedAt: Date;
  personalMessage: string | null;
  createdAt: Date;
}

export interface GetBeneficiaryKeepsakesResult {
  keepsakes: BeneficiaryKeepsakeItem[];
}

@Injectable()
export class GetBeneficiaryKeepsakesQuery {
  constructor(
    @Inject(KEEPSAKE_ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepository: KeepsakeAssignmentRepository,
    @Inject('VaultRepository')
    private readonly vaultRepository: VaultRepository,
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
  ) {}

  async execute(
    input: GetBeneficiaryKeepsakesInput,
  ): Promise<Result<GetBeneficiaryKeepsakesResult, string>> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      return err('Vault not found');
    }

    const beneficiary = await this.beneficiaryRepository.findById(input.beneficiaryId);
    if (!beneficiary || beneficiary.vaultId !== vault.id) {
      return err('Beneficiary not found');
    }

    const assignments = await this.assignmentRepository.findByBeneficiaryIdWithKeepsakes(
      input.beneficiaryId,
    );

    return ok({
      keepsakes: assignments.map((a) => ({
        id: a.id,
        keepsakeId: a.keepsakeId,
        keepsakeTitle: a.keepsakeTitle,
        keepsakeType: a.keepsakeType,
        keepsakeStatus: a.keepsakeStatus,
        keepsakeUpdatedAt: a.keepsakeUpdatedAt,
        personalMessage: a.personalMessage,
        createdAt: a.createdAt,
      })),
    });
  }
}
