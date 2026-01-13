import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import { Relationship } from '../../domain/entities/beneficiary.entity';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '../../domain/repositories/beneficiary.repository';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';

export interface ListBeneficiariesInput {
  userId: string;
}

export interface BeneficiaryListItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  relationship: Relationship;
  note: string | null;
  isTrustedPerson: boolean;
  assignmentCount: number;
  createdAt: Date;
}

export interface ListBeneficiariesResult {
  beneficiaries: BeneficiaryListItem[];
}

@Injectable()
export class ListBeneficiariesQuery {
  constructor(
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(input: ListBeneficiariesInput): Promise<Result<ListBeneficiariesResult, string>> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      return err('Vault not found');
    }

    const beneficiaries = await this.beneficiaryRepository.findByVaultId(vault.id);

    const beneficiariesWithCounts = await Promise.all(
      beneficiaries.map(async (b) => {
        const assignmentCount = await this.beneficiaryRepository.countAssignments(b.id);
        return {
          id: b.id,
          firstName: b.firstName,
          lastName: b.lastName,
          fullName: b.fullName,
          email: b.email,
          relationship: b.relationship,
          note: b.note,
          isTrustedPerson: b.isTrustedPerson,
          assignmentCount,
          createdAt: b.createdAt,
        };
      }),
    );

    return ok({ beneficiaries: beneficiariesWithCounts });
  }
}
