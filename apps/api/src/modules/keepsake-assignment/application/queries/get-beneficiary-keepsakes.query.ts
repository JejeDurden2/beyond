import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  KeepsakeAssignmentRepository,
  KeepsakeAssignmentWithKeepsake,
  KEEPSAKE_ASSIGNMENT_REPOSITORY,
} from '../../domain/repositories/keepsake-assignment.repository';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';
import {
  BENEFICIARY_REPOSITORY,
  BeneficiaryRepository,
} from '@/modules/beneficiary/domain/repositories/beneficiary.repository';

export interface GetBeneficiaryKeepsakesInput {
  userId: string;
  beneficiaryId: string;
}

export type BeneficiaryKeepsakeItem = KeepsakeAssignmentWithKeepsake;

export interface GetBeneficiaryKeepsakesResult {
  keepsakes: BeneficiaryKeepsakeItem[];
}

@Injectable()
export class GetBeneficiaryKeepsakesQuery {
  constructor(
    @Inject(KEEPSAKE_ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepository: KeepsakeAssignmentRepository,
    @Inject(VAULT_REPOSITORY)
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

    const keepsakes = await this.assignmentRepository.findByBeneficiaryIdWithKeepsakes(
      input.beneficiaryId,
    );

    return ok({ keepsakes });
  }
}
