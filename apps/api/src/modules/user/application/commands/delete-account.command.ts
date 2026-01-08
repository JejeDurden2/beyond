import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../../auth/domain/repositories/user.repository';

export interface DeleteAccountCommandInput {
  userId: string;
}

@Injectable()
export class DeleteAccountCommand {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: DeleteAccountCommandInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.softDelete();
    await this.userRepository.save(user);
  }
}
