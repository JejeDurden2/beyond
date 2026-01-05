import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';

export interface VerifyEmailCommandInput {
  token: string;
}

export interface VerifyEmailCommandOutput {
  success: boolean;
  message: string;
}

@Injectable()
export class VerifyEmailCommand {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: VerifyEmailCommandInput): Promise<VerifyEmailCommandOutput> {
    const user = await this.userRepository.findByVerificationToken(input.token);

    if (!user) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    const result = user.verifyEmail(input.token);
    if (result.isErr()) {
      throw new BadRequestException(result.error);
    }

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }
}
