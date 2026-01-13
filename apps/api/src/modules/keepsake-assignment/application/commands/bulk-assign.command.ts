import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  KeepsakeAssignmentRepository,
  KEEPSAKE_ASSIGNMENT_REPOSITORY,
} from '../../domain/repositories/keepsake-assignment.repository';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';
import {
  KEEPSAKE_REPOSITORY,
  KeepsakeRepository,
} from '@/modules/keepsake/domain/repositories/keepsake.repository';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '@/modules/beneficiary/domain/repositories/beneficiary.repository';

export interface BulkAssignInput {
  userId: string;
  keepsakeId: string;
  beneficiaryIds: string[];
}

@Injectable()
export class BulkAssignCommand {
  constructor(
    @Inject(KEEPSAKE_ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepository: KeepsakeAssignmentRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
    @Inject(KEEPSAKE_REPOSITORY)
    private readonly keepsakeRepository: KeepsakeRepository,
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
  ) {}

  async execute(input: BulkAssignInput): Promise<Result<void, string>> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      return err('Vault not found');
    }

    const keepsake = await this.keepsakeRepository.findById(input.keepsakeId);
    if (!keepsake || keepsake.vaultId !== vault.id) {
      return err('Keepsake not found');
    }

    const vaultBeneficiaries = await this.beneficiaryRepository.findByVaultId(vault.id);
    const validBeneficiaryIds = new Set(vaultBeneficiaries.map((b) => b.id));

    for (const beneficiaryId of input.beneficiaryIds) {
      if (!validBeneficiaryIds.has(beneficiaryId)) {
        return err(`Beneficiary ${beneficiaryId} not found in vault`);
      }
    }

    const existingAssignments = await this.assignmentRepository.findByKeepsakeId(input.keepsakeId);

    await this.assignmentRepository.bulkAssign(
      input.keepsakeId,
      input.beneficiaryIds,
      existingAssignments,
    );

    return ok(undefined);
  }
}
