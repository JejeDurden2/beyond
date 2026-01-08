import { Injectable, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../../auth/domain/repositories/user.repository';
import { Password } from '../../../auth/domain/value-objects/password.value-object';

export interface ChangePasswordCommandInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class ChangePasswordCommand {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: ChangePasswordCommandInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await user.verifyPassword(input.currentPassword);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newPasswordResult = await Password.create(input.newPassword);
    if (newPasswordResult.isErr()) {
      throw new UnauthorizedException(newPasswordResult.error);
    }

    await user.updatePassword(newPasswordResult.value);
    await this.userRepository.save(user);
  }
}
