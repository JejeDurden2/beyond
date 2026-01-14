import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  IBeneficiaryInvitationRepository,
  BENEFICIARY_INVITATION_REPOSITORY,
} from '../../domain/repositories/beneficiary-invitation.repository';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '../../domain/repositories/beneficiary.repository';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';
import {
  UserRepository,
  USER_REPOSITORY,
} from '@/modules/auth/domain/repositories/user.repository';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { KeepsakeStatus } from '@/modules/keepsake/domain/entities/keepsake.entity';

export interface BeneficiaryAccessInfoOutput {
  beneficiaryId: string;
  beneficiaryEmail: string;
  beneficiaryFirstName: string;
  beneficiaryLastName: string;
  isTrustedPerson: boolean;
  vaultOwnerName: string;
  keepsakeCount: number;
  hasAccount: boolean;
  invitationExpiresAt: string;
}

@Injectable()
export class GetBeneficiaryAccessInfoQuery {
  constructor(
    @Inject(BENEFICIARY_INVITATION_REPOSITORY)
    private readonly invitationRepository: IBeneficiaryInvitationRepository,
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(token: string): Promise<Result<BeneficiaryAccessInfoOutput, string>> {
    // Find invitation by token
    const invitation = await this.invitationRepository.findByToken(token);
    if (!invitation) {
      return err('Invitation not found or has expired');
    }

    // Check if invitation is expired
    if (invitation.isExpired()) {
      return err('This invitation has expired');
    }

    // Check if invitation is already accepted
    if (invitation.isAccepted) {
      return err('This invitation has already been accepted');
    }

    // Get beneficiary info
    const beneficiary = await this.beneficiaryRepository.findById(invitation.beneficiaryId);
    if (!beneficiary) {
      return err('Beneficiary not found');
    }

    // Get vault owner info
    const vault = await this.vaultRepository.findById(beneficiary.vaultId);
    if (!vault) {
      return err('Vault not found');
    }

    const vaultOwner = await this.userRepository.findById(vault.userId);
    const vaultOwnerName =
      vaultOwner?.firstName && vaultOwner?.lastName
        ? `${vaultOwner.firstName} ${vaultOwner.lastName}`
        : (vaultOwner?.email.value ?? 'Unknown');

    // Count delivered keepsakes for this beneficiary
    const keepsakeCount = await this.prisma.keepsakeAssignment.count({
      where: {
        beneficiaryId: beneficiary.id,
        keepsake: {
          status: KeepsakeStatus.DELIVERED,
        },
      },
    });

    return ok({
      beneficiaryId: beneficiary.id,
      beneficiaryEmail: beneficiary.email,
      beneficiaryFirstName: beneficiary.firstName,
      beneficiaryLastName: beneficiary.lastName,
      isTrustedPerson: beneficiary.isTrustedPerson,
      vaultOwnerName,
      keepsakeCount,
      hasAccount: beneficiary.hasAccount(),
      invitationExpiresAt: invitation.expiresAt.toISOString(),
    });
  }
}
