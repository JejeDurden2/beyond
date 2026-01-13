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

export interface UpdateBeneficiaryInput {
  userId: string;
  beneficiaryId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  relationship?: Relationship;
  note?: string | null;
}

export interface UpdateBeneficiaryResult {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  relationship: Relationship;
  note: string | null;
  createdAt: Date;
}

@Injectable()
export class UpdateBeneficiaryCommand {
  constructor(
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(input: UpdateBeneficiaryInput): Promise<Result<UpdateBeneficiaryResult, string>> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      return err('Vault not found');
    }

    const beneficiary = await this.beneficiaryRepository.findById(input.beneficiaryId);
    if (!beneficiary || beneficiary.vaultId !== vault.id) {
      return err('Beneficiary not found');
    }

    if (input.email && input.email.toLowerCase() !== beneficiary.email) {
      const existingBeneficiary = await this.beneficiaryRepository.findByEmail(
        vault.id,
        input.email.toLowerCase(),
      );
      if (existingBeneficiary) {
        return err('A beneficiary with this email already exists');
      }
    }

    const updateResult = beneficiary.update({
      firstName: input.firstName?.trim(),
      lastName: input.lastName?.trim(),
      email: input.email?.toLowerCase().trim(),
      relationship: input.relationship,
      note: input.note === null ? null : input.note?.trim(),
    });

    if (updateResult.isErr()) {
      return err(updateResult.error);
    }

    await this.beneficiaryRepository.save(beneficiary);

    return ok({
      id: beneficiary.id,
      firstName: beneficiary.firstName,
      lastName: beneficiary.lastName,
      fullName: beneficiary.fullName,
      email: beneficiary.email,
      relationship: beneficiary.relationship,
      note: beneficiary.note,
      createdAt: beneficiary.createdAt,
    });
  }
}
