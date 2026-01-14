import { Injectable, Inject, Logger } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
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

      // Generate invitation token if not already present
      if (!beneficiary.invitationToken) {
        beneficiary.generateInvitationToken();
      }

      await this.beneficiaryRepository.save(beneficiary);

      // Send invitation email to the trusted person
      await this.sendTrustedPersonInvitationEmail(input.userId, beneficiary);
    } else {
      beneficiary.unmarkAsTrustedPerson();
      await this.beneficiaryRepository.save(beneficiary);
    }

    return ok(undefined);
  }

  private async sendTrustedPersonInvitationEmail(
    vaultOwnerId: string,
    beneficiary: { email: string; fullName: string; invitationToken: string | null },
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

      if (!beneficiary.invitationToken) {
        this.logger.error('Beneficiary invitation token is missing');
        return;
      }

      await this.emailService.sendTrustedPersonInvitation({
        to: beneficiary.email,
        trustedPersonName: beneficiary.fullName,
        vaultOwnerName,
        invitationToken: beneficiary.invitationToken,
        locale: 'fr', // Default to French, could be made configurable
      });

      this.logger.log(`Trusted person invitation email sent to ${beneficiary.email}`);
    } catch (error) {
      this.logger.error(`Failed to send trusted person invitation email: ${error}`);
      // Don't fail the command if email fails - the trusted person is still set
    }
  }
}
