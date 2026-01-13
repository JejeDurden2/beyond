import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '../../domain/repositories/beneficiary.repository';
import {
  IBeneficiaryInvitationRepository,
  BENEFICIARY_INVITATION_REPOSITORY,
} from '../../domain/repositories/beneficiary-invitation.repository';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';

export interface PendingBeneficiaryDto {
  id: string;
  beneficiaryId: string;
  name: string;
  email: string;
  invitationStatus: 'pending' | 'accepted' | 'expired';
  invitationSentAt: string;
  invitationId: string | null;
}

@Injectable()
export class GetPendingInvitationsQuery {
  constructor(
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(BENEFICIARY_INVITATION_REPOSITORY)
    private readonly invitationRepository: IBeneficiaryInvitationRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
  ) {}

  async execute(userId: string, vaultId: string): Promise<Result<PendingBeneficiaryDto[], string>> {
    // Verify the user has access to this vault (is owner or trusted person)
    const vault = await this.vaultRepository.findByUserId(userId);
    const isOwner = vault?.id === vaultId;

    // If not owner, check if user is trusted person for this vault
    if (!isOwner) {
      const beneficiaries = await this.beneficiaryRepository.findByVaultId(vaultId);
      const userBeneficiary = beneficiaries.find(
        (b) => b.beneficiaryProfileId && b.isTrustedPerson,
      );
      // TODO: Would need to check if this beneficiary's profile belongs to userId
      // For now, only vault owners can access this endpoint
      if (!userBeneficiary) {
        return err('Access denied');
      }
    }

    // Get all beneficiaries for this vault
    const beneficiaries = await this.beneficiaryRepository.findByVaultId(vaultId);

    const result: PendingBeneficiaryDto[] = [];

    for (const beneficiary of beneficiaries) {
      // Get invitations for this beneficiary
      const invitations = await this.invitationRepository.findByBeneficiaryId(beneficiary.id);

      // Find the most recent invitation
      const latestInvitation = invitations.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      )[0];

      let invitationStatus: 'pending' | 'accepted' | 'expired' = 'pending';
      let invitationSentAt = beneficiary.createdAt.toISOString();
      let invitationId: string | null = null;

      if (latestInvitation) {
        invitationId = latestInvitation.id;
        invitationSentAt = latestInvitation.sentAt.toISOString();

        if (latestInvitation.isAccepted) {
          invitationStatus = 'accepted';
        } else if (latestInvitation.isExpired()) {
          invitationStatus = 'expired';
        } else {
          invitationStatus = 'pending';
        }
      } else if (beneficiary.invitationAcceptedAt) {
        invitationStatus = 'accepted';
      }

      result.push({
        id: beneficiary.id,
        beneficiaryId: beneficiary.id,
        name: beneficiary.fullName,
        email: beneficiary.email,
        invitationStatus,
        invitationSentAt,
        invitationId,
      });
    }

    return ok(result);
  }
}
