import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import { VaultRepository, VAULT_REPOSITORY } from '../../domain/repositories/vault.repository';
import { DeathDeclaredEvent } from '../../domain/events/death-declared.event';
import { DomainEventPublisher } from '@/shared/domain/domain-event-publisher.service';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import {
  BENEFICIARY_REPOSITORY,
  BeneficiaryRepository,
} from '@/modules/beneficiary/domain/repositories/beneficiary.repository';
import {
  BENEFICIARY_PROFILE_REPOSITORY,
  IBeneficiaryProfileRepository,
} from '@/modules/beneficiary/domain/repositories/beneficiary-profile.repository';

export interface DeclareDeathInput {
  userId: string;
  vaultId: string;
}

export interface DeclareDeathOutput {
  declarationId: string;
  vaultId: string;
  declaredAt: Date;
}

@Injectable()
export class DeclareDeathCommand {
  constructor(
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(BENEFICIARY_PROFILE_REPOSITORY)
    private readonly profileRepository: IBeneficiaryProfileRepository,
    private readonly eventPublisher: DomainEventPublisher,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: DeclareDeathInput): Promise<Result<DeclareDeathOutput, string>> {
    // 1. Verify the user has a beneficiary profile
    const profile = await this.profileRepository.findByUserId(input.userId);
    if (!profile) {
      return err('User is not a beneficiary');
    }

    // 2. Verify the user is a trusted person for this vault
    const beneficiaries = await this.beneficiaryRepository.findByVaultId(input.vaultId);
    const trustedBeneficiary = beneficiaries.find(
      (b) => b.beneficiaryProfileId === profile.id && b.isTrustedPerson,
    );

    if (!trustedBeneficiary) {
      return err('User is not a trusted person for this vault');
    }

    // 3. Verify the vault exists
    const vault = await this.vaultRepository.findById(input.vaultId);
    if (!vault) {
      return err('Vault not found');
    }

    // 4. Check if death has already been declared for this vault
    const existingDeclaration = await this.prisma.deathDeclaration.findFirst({
      where: { vaultId: input.vaultId },
    });

    if (existingDeclaration) {
      return err('Death has already been declared for this vault');
    }

    // 5. Create the death declaration record
    const declaration = await this.prisma.deathDeclaration.create({
      data: {
        vaultId: input.vaultId,
        declaredById: trustedBeneficiary.id,
        declaredAt: new Date(),
      },
    });

    // 6. Emit the death declared event to trigger keepsake delivery
    const event = DeathDeclaredEvent.create(input.vaultId, trustedBeneficiary.id);
    await this.eventPublisher.publish([event]);

    return ok({
      declarationId: declaration.id,
      vaultId: declaration.vaultId,
      declaredAt: declaration.declaredAt,
    });
  }
}
