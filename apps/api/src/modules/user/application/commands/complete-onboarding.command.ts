import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../../auth/domain/repositories/user.repository';

export interface CompleteOnboardingCommandInput {
  userId: string;
}

export interface CompleteOnboardingCommandOutput {
  onboardingCompletedAt: Date;
}

@Injectable()
export class CompleteOnboardingCommand {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CompleteOnboardingCommandInput): Promise<CompleteOnboardingCommandOutput> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Make idempotent - return existing timestamp if already completed
    if (user.onboardingCompletedAt) {
      return {
        onboardingCompletedAt: user.onboardingCompletedAt,
      };
    }

    user.completeOnboarding();
    await this.userRepository.save(user);

    return {
      onboardingCompletedAt: user.onboardingCompletedAt!,
    };
  }
}
