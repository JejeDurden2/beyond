import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';

export interface GetCurrentUserQueryInput {
  userId: string;
}

export interface GetCurrentUserQueryOutput {
  id: string;
  email: string;
  emailVerified: boolean;
  hasTotpEnabled: boolean;
  createdAt: Date;
}

@Injectable()
export class GetCurrentUserQuery {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: GetCurrentUserQueryInput): Promise<GetCurrentUserQueryOutput> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email.value,
      emailVerified: user.emailVerified,
      hasTotpEnabled: !!user.totpSecret,
      createdAt: user.createdAt,
    };
  }
}
