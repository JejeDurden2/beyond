import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import { Relationship } from '../../domain/entities/beneficiary.entity';
import { BeneficiaryRepository } from '../../domain/repositories/beneficiary.repository';
import { VaultRepository } from '@/modules/vault/domain/repositories/vault.repository';

export interface GetBeneficiaryInput {
  userId: string;
  beneficiaryId: string;
}

export interface GetBeneficiaryResult {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  relationship: Relationship;
  note: string | null;
  assignmentCount: number;
  createdAt: Date;
}

@Injectable()
export class GetBeneficiaryQuery {
  constructor(
    @Inject('BeneficiaryRepository')
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject('VaultRepository')
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(input: GetBeneficiaryInput): Promise<Result<GetBeneficiaryResult, string>> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      return err('Vault not found');
    }

    const beneficiary = await this.beneficiaryRepository.findById(input.beneficiaryId);
    if (!beneficiary || beneficiary.vaultId !== vault.id) {
      return err('Beneficiary not found');
    }

    const assignmentCount = await this.beneficiaryRepository.countAssignments(beneficiary.id);

    return ok({
      id: beneficiary.id,
      firstName: beneficiary.firstName,
      lastName: beneficiary.lastName,
      fullName: beneficiary.fullName,
      email: beneficiary.email,
      relationship: beneficiary.relationship,
      note: beneficiary.note,
      assignmentCount,
      createdAt: beneficiary.createdAt,
    });
  }
}
