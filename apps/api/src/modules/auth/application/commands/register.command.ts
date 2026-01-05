import { Injectable, Inject, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import { UserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { CreateVaultHandler } from '@/modules/vault/application/commands/create-vault.handler';

export interface RegisterCommandInput {
  email: string;
  password: string;
}

export interface RegisterCommandOutput {
  accessToken: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
}

@Injectable()
export class RegisterCommand {
  private readonly logger = new Logger(RegisterCommand.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly createVaultHandler: CreateVaultHandler,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: RegisterCommandInput): Promise<RegisterCommandOutput> {
    const emailResult = Email.create(input.email);
    if (emailResult.isErr()) {
      throw new BadRequestException(emailResult.error);
    }

    const existingUser = await this.userRepository.findByEmail(emailResult.value);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const userResult = await User.create({
      email: input.email,
      password: input.password,
    });

    if (userResult.isErr()) {
      throw new BadRequestException(userResult.error);
    }

    const user = userResult.value;
    await this.userRepository.save(user);

    // Auto-create vault for the user
    await this.createVaultHandler.execute({ userId: user.id });

    // Log verification email (MVP - would send email in production)
    this.logger.log(
      `Verification link for ${user.email.value}: /auth/verify/${user.emailVerificationToken}`,
    );

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email.value,
      emailVerified: user.emailVerified,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email.value,
        emailVerified: user.emailVerified,
      },
    };
  }
}
