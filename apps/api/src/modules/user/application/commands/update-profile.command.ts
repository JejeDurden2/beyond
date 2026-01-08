import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../../auth/domain/repositories/user.repository';

export interface UpdateProfileCommandInput {
  userId: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateProfileCommandOutput {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  onboardingCompletedAt: Date | null;
}

@Injectable()
export class UpdateProfileCommand {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: UpdateProfileCommandInput): Promise<UpdateProfileCommandOutput> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.updateProfile({
      firstName: input.firstName,
      lastName: input.lastName,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      onboardingCompletedAt: user.onboardingCompletedAt,
    };
  }
}
