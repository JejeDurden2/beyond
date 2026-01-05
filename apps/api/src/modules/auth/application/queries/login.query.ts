import { Injectable, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Email } from '../../domain/value-objects/email.value-object';
import { UserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';

export interface LoginQueryInput {
  email: string;
  password: string;
}

export interface LoginQueryOutput {
  accessToken: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
}

@Injectable()
export class LoginQuery {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginQueryInput): Promise<LoginQueryOutput> {
    const emailResult = Email.create(input.email);
    if (emailResult.isErr()) {
      throw new BadRequestException(emailResult.error);
    }

    const user = await this.userRepository.findByEmail(emailResult.value);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.verifyPassword(input.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
