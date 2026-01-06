import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import { Beneficiary, Relationship } from '../../domain/entities/beneficiary.entity';
import { BeneficiaryRepository } from '../../domain/repositories/beneficiary.repository';
import { VaultRepository } from '@/modules/vault/domain/repositories/vault.repository';

export interface CreateBeneficiaryInput {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  relationship: Relationship;
  note?: string;
}

export interface CreateBeneficiaryResult {
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
export class CreateBeneficiaryCommand {
  constructor(
    @Inject('BeneficiaryRepository')
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject('VaultRepository')
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(input: CreateBeneficiaryInput): Promise<Result<CreateBeneficiaryResult, string>> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      return err('Vault not found');
    }

    const existingBeneficiary = await this.beneficiaryRepository.findByEmail(
      vault.id,
      input.email.toLowerCase(),
    );
    if (existingBeneficiary) {
      return err('A beneficiary with this email already exists');
    }

    const beneficiaryResult = Beneficiary.create({
      vaultId: vault.id,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.toLowerCase().trim(),
      relationship: input.relationship,
      note: input.note?.trim() || null,
    });

    if (beneficiaryResult.isErr()) {
      return err(beneficiaryResult.error);
    }

    const beneficiary = beneficiaryResult.value;
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
