import { Injectable, Inject, Logger } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '../../domain/repositories/beneficiary.repository';
import {
  IBeneficiaryInvitationRepository,
  BENEFICIARY_INVITATION_REPOSITORY,
} from '../../domain/repositories/beneficiary-invitation.repository';
import { BeneficiaryInvitation } from '../../domain/entities/beneficiary-invitation.entity';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';
import {
  UserRepository,
  USER_REPOSITORY,
} from '@/modules/auth/domain/repositories/user.repository';
import { IEmailService, EMAIL_SERVICE } from '@/shared/ports/email.port';

export interface SetTrustedPersonInput {
  userId: string;
  beneficiaryId: string;
  isTrustedPerson: boolean;
}

@Injectable()
export class SetTrustedPersonCommand {
  private readonly logger = new Logger(SetTrustedPersonCommand.name);

  constructor(
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(BENEFICIARY_INVITATION_REPOSITORY)
    private readonly invitationRepository: IBeneficiaryInvitationRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
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
      await this.beneficiaryRepository.save(beneficiary);

      // Create a BeneficiaryInvitation record (without keepsakeId for trusted person invitations)
      const invitationResult = BeneficiaryInvitation.create({
        beneficiaryId: beneficiary.id,
        keepsakeId: null, // Trusted person invitations don't have a keepsake
        expiresInDays: 30,
      });

      if (invitationResult.isErr()) {
        this.logger.error(`Failed to create invitation: ${invitationResult.error}`);
        return err(invitationResult.error);
      }

      const invitation = invitationResult.value;
      await this.invitationRepository.save(invitation);

      // Send invitation email to the trusted person
      await this.sendTrustedPersonInvitationEmail(input.userId, beneficiary, invitation.token);
    } else {
      beneficiary.unmarkAsTrustedPerson();
      await this.beneficiaryRepository.save(beneficiary);
    }

    return ok(undefined);
  }

  private async sendTrustedPersonInvitationEmail(
    vaultOwnerId: string,
    beneficiary: { email: string; fullName: string },
    invitationToken: string,
  ): Promise<void> {
    try {
      const vaultOwner = await this.userRepository.findById(vaultOwnerId);
      if (!vaultOwner) {
        this.logger.error(`Vault owner ${vaultOwnerId} not found`);
        return;
      }

      const vaultOwnerName =
        vaultOwner.firstName && vaultOwner.lastName
          ? `${vaultOwner.firstName} ${vaultOwner.lastName}`
          : vaultOwner.email.value;

      await this.emailService.sendTrustedPersonInvitation({
        to: beneficiary.email,
        trustedPersonName: beneficiary.fullName,
        vaultOwnerName,
        invitationToken,
        locale: 'fr', // Default to French, could be made configurable
      });

      this.logger.log(`Trusted person invitation email sent to ${beneficiary.email}`);
    } catch (error) {
      this.logger.error(`Failed to send trusted person invitation email: ${error}`);
      // Don't fail the command if email fails - the trusted person is still set
    }
  }
}
