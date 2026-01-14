import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';
import {
  IBeneficiaryProfileRepository,
  BENEFICIARY_PROFILE_REPOSITORY,
} from '@/modules/beneficiary/domain/repositories/beneficiary-profile.repository';
import { UserRole } from '../../domain/entities/user.entity';

export interface GetCurrentUserQueryInput {
  userId: string;
}

export interface GetCurrentUserQueryOutput {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  onboardingCompletedAt: Date | null;
  emailVerified: boolean;
  hasTotpEnabled: boolean;
  role: UserRole;
  hasBeneficiaryProfile: boolean;
  createdAt: Date;
}

@Injectable()
export class GetCurrentUserQuery {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(BENEFICIARY_PROFILE_REPOSITORY)
    private readonly beneficiaryProfileRepository: IBeneficiaryProfileRepository,
  ) {}

  async execute(input: GetCurrentUserQueryInput): Promise<GetCurrentUserQueryOutput> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const beneficiaryProfile = await this.beneficiaryProfileRepository.findByUserId(input.userId);

    return {
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      onboardingCompletedAt: user.onboardingCompletedAt,
      emailVerified: user.emailVerified,
      hasTotpEnabled: !!user.totpSecret,
      role: user.role,
      hasBeneficiaryProfile: !!beneficiaryProfile,
      createdAt: user.createdAt,
    };
  }
}
