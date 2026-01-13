import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '../../domain/repositories/beneficiary.repository';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';

export interface SetTrustedPersonInput {
  userId: string;
  beneficiaryId: string;
  isTrustedPerson: boolean;
}

@Injectable()
export class SetTrustedPersonCommand {
  constructor(
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(input: SetTrustedPersonInput): Promise<Result<void, string>> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      return err('Vault not found');
    }

    const beneficiary = await this.beneficiaryRepository.findById(input.beneficiaryId);
    if (!beneficiary || beneficiary.vaultId !== vault.id) {
      return err('Beneficiary not found');
    }

    // If setting as trusted person, unmark any existing trusted person first
    if (input.isTrustedPerson) {
      const allBeneficiaries = await this.beneficiaryRepository.findByVaultId(vault.id);
      for (const b of allBeneficiaries) {
        if (b.isTrustedPerson && b.id !== input.beneficiaryId) {
          b.unmarkAsTrustedPerson();
          await this.beneficiaryRepository.save(b);
        }
      }
      beneficiary.markAsTrustedPerson();
    } else {
      beneficiary.unmarkAsTrustedPerson();
    }

    await this.beneficiaryRepository.save(beneficiary);

    return ok(undefined);
  }
}
