import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  IBeneficiaryInvitationRepository,
  BENEFICIARY_INVITATION_REPOSITORY,
} from '../../domain/repositories/beneficiary-invitation.repository';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '../../domain/repositories/beneficiary.repository';
import { Beneficiary } from '../../domain/entities/beneficiary.entity';
import {
  IBeneficiaryProfileRepository,
  BENEFICIARY_PROFILE_REPOSITORY,
} from '../../domain/repositories/beneficiary-profile.repository';
import {
  UserRepository,
  USER_REPOSITORY,
} from '@/modules/auth/domain/repositories/user.repository';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';
import {
  KeepsakeAssignmentRepository,
  KEEPSAKE_ASSIGNMENT_REPOSITORY,
} from '@/modules/keepsake-assignment/domain/repositories/keepsake-assignment.repository';
import { IEmailService, EMAIL_SERVICE } from '@/shared/ports';

export interface ResendBeneficiaryInvitationInput {
  invitationId: string;
  requestingUserId: string;
}

export interface ResendBeneficiaryInvitationOutput {
  invitationId: string;
  newToken: string;
  resentCount: number;
}

@Injectable()
export class ResendBeneficiaryInvitationCommand {
  private readonly logger = new Logger(ResendBeneficiaryInvitationCommand.name);

  constructor(
    @Inject(BENEFICIARY_INVITATION_REPOSITORY)
    private readonly invitationRepository: IBeneficiaryInvitationRepository,
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(BENEFICIARY_PROFILE_REPOSITORY)
    private readonly profileRepository: IBeneficiaryProfileRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
    @Inject(KEEPSAKE_ASSIGNMENT_REPOSITORY)
    private readonly keepsakeAssignmentRepository: KeepsakeAssignmentRepository,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
  ) {}

  async execute(
    input: ResendBeneficiaryInvitationInput,
  ): Promise<Result<ResendBeneficiaryInvitationOutput, string>> {
    const invitation = await this.invitationRepository.findById(input.invitationId);
    if (!invitation) {
      return err('Invitation not found');
    }

    const beneficiary = await this.beneficiaryRepository.findById(invitation.beneficiaryId);
    if (!beneficiary) {
      return err('Beneficiary not found');
    }

    const vault = await this.vaultRepository.findById(beneficiary.vaultId);
    if (!vault) {
      return err('Vault not found');
    }

    const isAuthorized = await this.isUserAuthorizedToResend(input.requestingUserId, vault);
    if (!isAuthorized) {
      return err('Only the vault owner or trusted person can resend invitations');
    }

    const resendResult = invitation.resend(input.requestingUserId);
    if (resendResult.isErr()) {
      return err(resendResult.error);
    }

    await this.invitationRepository.save(invitation);

    const emailResult = await this.sendInvitationEmail(vault.userId, beneficiary, invitation.token);
    if (emailResult.isErr()) {
      return err(emailResult.error);
    }

    this.logger.log(
      `Invitation ${invitation.id} resent by user ${input.requestingUserId} (count: ${invitation.resentCount})`,
    );

    return ok({
      invitationId: invitation.id,
      newToken: invitation.token,
      resentCount: invitation.resentCount,
    });
  }

  private async isUserAuthorizedToResend(
    userId: string,
    vault: { id: string; userId: string },
  ): Promise<boolean> {
    if (vault.userId === userId) {
      return true;
    }

    const userProfile = await this.profileRepository.findByUserId(userId);
    if (!userProfile) {
      return false;
    }

    const vaultBeneficiaries = await this.beneficiaryRepository.findByVaultId(vault.id);
    return vaultBeneficiaries.some(
      (b: Beneficiary) => b.beneficiaryProfileId === userProfile.id && b.isTrustedPerson,
    );
  }

  private async sendInvitationEmail(
    vaultOwnerId: string,
    beneficiary: { id: string; email: string; fullName: string },
    invitationToken: string,
  ): Promise<Result<void, string>> {
    const vaultOwner = await this.userRepository.findById(vaultOwnerId);
    if (!vaultOwner) {
      return err('Vault owner not found');
    }

    const assignments = await this.keepsakeAssignmentRepository.findByBeneficiaryId(beneficiary.id);
    const senderName = this.formatUserName(vaultOwner);

    return this.emailService
      .sendBeneficiaryInvitation({
        to: beneficiary.email,
        beneficiaryName: beneficiary.fullName,
        senderName,
        invitationToken,
        keepsakeCount: assignments.length,
        locale: 'fr',
      })
      .then(() => ok<void, string>(undefined))
      .catch((error) => {
        this.logger.error(`Failed to send invitation email: ${error}`);
        return err('Failed to send invitation email');
      });
  }

  private formatUserName(user: {
    firstName: string | null;
    lastName: string | null;
    email: { value: string };
  }): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email.value;
  }
}
