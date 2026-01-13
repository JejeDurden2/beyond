import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  IBeneficiaryInvitationRepository,
  BENEFICIARY_INVITATION_REPOSITORY,
} from '../../domain/repositories/beneficiary-invitation.repository';
import {
  IBeneficiaryProfileRepository,
  BENEFICIARY_PROFILE_REPOSITORY,
} from '../../domain/repositories/beneficiary-profile.repository';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '../../domain/repositories/beneficiary.repository';
import {
  UserRepository,
  USER_REPOSITORY,
} from '@/modules/auth/domain/repositories/user.repository';
import { User, UserRole } from '@/modules/auth/domain/entities/user.entity';
import { Email } from '@/modules/auth/domain/value-objects/email.value-object';
import { BeneficiaryProfile } from '../../domain/entities/beneficiary-profile.entity';
import { IEmailService, EMAIL_SERVICE } from '@/shared/ports';

export interface AcceptBeneficiaryInvitationInput {
  token: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AcceptBeneficiaryInvitationOutput {
  userId: string;
  beneficiaryProfileId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

@Injectable()
export class AcceptBeneficiaryInvitationCommand {
  private readonly logger = new Logger(AcceptBeneficiaryInvitationCommand.name);

  constructor(
    @Inject(BENEFICIARY_INVITATION_REPOSITORY)
    private readonly invitationRepository: IBeneficiaryInvitationRepository,
    @Inject(BENEFICIARY_PROFILE_REPOSITORY)
    private readonly profileRepository: IBeneficiaryProfileRepository,
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
  ) {}

  async execute(
    input: AcceptBeneficiaryInvitationInput,
  ): Promise<Result<AcceptBeneficiaryInvitationOutput, string>> {
    const invitation = await this.invitationRepository.findByToken(input.token);
    if (!invitation) {
      return err('Invitation not found');
    }

    const acceptResult = invitation.accept();
    if (acceptResult.isErr()) {
      return err(acceptResult.error);
    }

    const beneficiary = await this.beneficiaryRepository.findById(invitation.beneficiaryId);
    if (!beneficiary) {
      return err('Beneficiary not found');
    }

    const emailResult = Email.create(beneficiary.email);
    if (emailResult.isErr()) {
      return err(emailResult.error);
    }

    const existingUser = await this.userRepository.findByEmail(emailResult.value);
    const userAndProfileResult = existingUser
      ? await this.handleExistingUser(existingUser)
      : await this.createNewUser(beneficiary.email, input);

    if (userAndProfileResult.isErr()) {
      return err(userAndProfileResult.error);
    }

    const { user, profile, isNewUser } = userAndProfileResult.value;

    beneficiary.linkToProfile(profile.id);
    beneficiary.acceptInvitation();
    await this.beneficiaryRepository.save(beneficiary);
    await this.invitationRepository.save(invitation);

    if (isNewUser) {
      await this.sendWelcomeEmail(user.email.value, user.firstName ?? beneficiary.fullName);
    }

    this.logger.log(
      `Beneficiary invitation accepted successfully for ${beneficiary.email} (isNewUser: ${isNewUser})`,
    );

    return ok({
      userId: user.id,
      beneficiaryProfileId: profile.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  private async handleExistingUser(
    user: User,
  ): Promise<Result<{ user: User; profile: BeneficiaryProfile; isNewUser: false }, string>> {
    this.logger.log(
      `User already exists with email ${user.email.value}, linking to beneficiary profile`,
    );

    if (user.role === UserRole.VAULT_OWNER) {
      const upgradeResult = user.linkBeneficiaryProfile();
      if (upgradeResult.isErr()) {
        return err(upgradeResult.error);
      }
      await this.userRepository.save(user);
    }

    const existingProfile = await this.profileRepository.findByUserId(user.id);
    if (existingProfile) {
      return ok({ user, profile: existingProfile, isNewUser: false });
    }

    const profileResult = BeneficiaryProfile.create(user.id);
    if (profileResult.isErr()) {
      return err(profileResult.error);
    }

    await this.profileRepository.save(profileResult.value);
    return ok({ user, profile: profileResult.value, isNewUser: false });
  }

  private async createNewUser(
    email: string,
    input: AcceptBeneficiaryInvitationInput,
  ): Promise<Result<{ user: User; profile: BeneficiaryProfile; isNewUser: true }, string>> {
    this.logger.log(`Creating new user account for ${email}`);

    const userResult = await User.create({
      email,
      password: input.password,
      role: UserRole.BENEFICIARY,
    });

    if (userResult.isErr()) {
      return err(userResult.error);
    }

    const user = userResult.value;

    if (input.firstName || input.lastName) {
      user.updateProfile({
        firstName: input.firstName,
        lastName: input.lastName,
      });
    }

    await this.userRepository.save(user);

    const profileResult = BeneficiaryProfile.create(user.id);
    if (profileResult.isErr()) {
      return err(profileResult.error);
    }

    await this.profileRepository.save(profileResult.value);
    return ok({ user, profile: profileResult.value, isNewUser: true });
  }

  private async sendWelcomeEmail(email: string, beneficiaryName: string): Promise<void> {
    try {
      await this.emailService.sendBeneficiaryAccountCreated({
        to: email,
        beneficiaryName,
        locale: 'fr', // TODO: Get from user preference or invitation
      });
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error}`);
    }
  }
}
