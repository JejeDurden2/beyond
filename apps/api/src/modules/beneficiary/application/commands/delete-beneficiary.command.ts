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

export interface DeleteBeneficiaryInput {
  userId: string;
  beneficiaryId: string;
}

@Injectable()
export class DeleteBeneficiaryCommand {
  constructor(
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(input: DeleteBeneficiaryInput): Promise<Result<void, string>> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      return err('Vault not found');
    }

    const beneficiary = await this.beneficiaryRepository.findById(input.beneficiaryId);
    if (!beneficiary || beneficiary.vaultId !== vault.id) {
      return err('Beneficiary not found');
    }

    await this.beneficiaryRepository.delete(input.beneficiaryId);

    return ok(undefined);
  }
}
