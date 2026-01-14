import { Injectable, Inject, Logger } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  IBeneficiaryInvitationRepository,
  BENEFICIARY_INVITATION_REPOSITORY,
} from '../../domain/repositories/beneficiary-invitation.repository';
import {
  IBeneficiaryAccessTokenRepository,
  BENEFICIARY_ACCESS_TOKEN_REPOSITORY,
} from '../../domain/repositories/beneficiary-access-token.repository';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '../../domain/repositories/beneficiary.repository';
import { BeneficiaryAccessToken } from '../../domain/entities/beneficiary-access-token.entity';

export interface CreateTemporaryAccessInput {
  invitationToken: string;
}

export interface CreateTemporaryAccessOutput {
  accessToken: string;
  expiresAt: string;
  beneficiaryId: string;
}

@Injectable()
export class CreateTemporaryAccessCommand {
  private readonly logger = new Logger(CreateTemporaryAccessCommand.name);

  constructor(
    @Inject(BENEFICIARY_INVITATION_REPOSITORY)
    private readonly invitationRepository: IBeneficiaryInvitationRepository,
    @Inject(BENEFICIARY_ACCESS_TOKEN_REPOSITORY)
    private readonly accessTokenRepository: IBeneficiaryAccessTokenRepository,
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
  ) {}

  async execute(
    input: CreateTemporaryAccessInput,
  ): Promise<Result<CreateTemporaryAccessOutput, string>> {
    // Find invitation by token
    const invitation = await this.invitationRepository.findByToken(input.invitationToken);
    if (!invitation) {
      return err('Invitation not found');
    }

    // Check if invitation is expired
    if (invitation.isExpired()) {
      return err('This invitation has expired');
    }

    // Check if invitation is already accepted (user has account)
    if (invitation.isAccepted) {
      return err('This invitation has already been used to create an account');
    }

    // Get beneficiary
    const beneficiary = await this.beneficiaryRepository.findById(invitation.beneficiaryId);
    if (!beneficiary) {
      return err('Beneficiary not found');
    }

    // Trusted persons must create an account
    if (beneficiary.isTrustedPerson) {
      return err('As a trusted person, you must create an account to access the portal');
    }

    // Check if there's already a valid access token for this beneficiary
    const existingToken = await this.accessTokenRepository.findValidByBeneficiaryId(beneficiary.id);
    if (existingToken) {
      // Return existing token
      return ok({
        accessToken: existingToken.token,
        expiresAt: existingToken.expiresAt.toISOString(),
        beneficiaryId: beneficiary.id,
      });
    }

    // Create new access token (7 days)
    const accessTokenResult = BeneficiaryAccessToken.create({
      beneficiaryId: beneficiary.id,
      expiresInDays: 7,
    });

    if (accessTokenResult.isErr()) {
      this.logger.error(`Failed to create access token: ${accessTokenResult.error}`);
      return err(accessTokenResult.error);
    }

    const accessToken = accessTokenResult.value;
    await this.accessTokenRepository.save(accessToken);

    // Mark invitation as viewed (but not accepted - they didn't create account)
    if (invitation.isPending) {
      invitation.markAsViewed();
      await this.invitationRepository.save(invitation);
    }

    this.logger.log(`Created temporary access token for beneficiary ${beneficiary.id}`);

    return ok({
      accessToken: accessToken.token,
      expiresAt: accessToken.expiresAt.toISOString(),
      beneficiaryId: beneficiary.id,
    });
  }
}
