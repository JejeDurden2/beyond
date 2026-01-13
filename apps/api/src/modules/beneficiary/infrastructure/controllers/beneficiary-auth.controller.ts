import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import {
  AcceptBeneficiaryInvitationCommand,
  AcceptBeneficiaryInvitationInput,
} from '../../application/commands/accept-beneficiary-invitation.command';
import {
  IBeneficiaryInvitationRepository,
  BENEFICIARY_INVITATION_REPOSITORY,
} from '../../domain/repositories/beneficiary-invitation.repository';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '../../domain/repositories/beneficiary.repository';
import {
  UserRepository,
  USER_REPOSITORY,
} from '@/modules/auth/domain/repositories/user.repository';
import { UserRole } from '@/modules/auth/domain/entities/user.entity';
import { Email } from '@/modules/auth/domain/value-objects/email.value-object';

class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

class BeneficiaryLoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsString()
  password!: string;
}

@Controller('beneficiary/auth')
export class BeneficiaryAuthController {
  constructor(
    private readonly acceptInvitationCommand: AcceptBeneficiaryInvitationCommand,
    @Inject(BENEFICIARY_INVITATION_REPOSITORY)
    private readonly invitationRepository: IBeneficiaryInvitationRepository,
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  @Get('invitation/:token')
  async getInvitationInfo(@Param('token') token: string) {
    const invitation = await this.invitationRepository.findByToken(token);
    if (!invitation) {
      return { error: 'Invitation not found' };
    }

    if (invitation.isExpired()) {
      return { error: 'Invitation has expired' };
    }

    if (invitation.isAccepted) {
      return { error: 'Invitation has already been accepted' };
    }

    const beneficiary = await this.beneficiaryRepository.findById(invitation.beneficiaryId);
    if (!beneficiary) {
      return { error: 'Beneficiary not found' };
    }

    return {
      email: beneficiary.email,
      firstName: beneficiary.firstName,
      lastName: beneficiary.lastName,
      expiresAt: invitation.expiresAt,
    };
  }

  @Post('accept-invitation')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    const input: AcceptBeneficiaryInvitationInput = {
      token: dto.token,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
    };

    const result = await this.acceptInvitationCommand.execute(input);

    if (result.isErr()) {
      return { error: result.error };
    }

    const output = result.value;

    const accessToken = this.jwtService.sign({
      sub: output.userId,
      email: output.email,
      role: UserRole.BENEFICIARY,
    });

    return {
      accessToken,
      user: {
        id: output.userId,
        email: output.email,
        firstName: output.firstName,
        lastName: output.lastName,
        beneficiaryProfileId: output.beneficiaryProfileId,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: BeneficiaryLoginDto) {
    const emailResult = Email.create(dto.email);
    if (emailResult.isErr()) {
      return { error: 'Invalid credentials' };
    }

    const user = await this.userRepository.findByEmail(emailResult.value);
    if (!user) {
      return { error: 'Invalid credentials' };
    }

    const isPasswordValid = await user.verifyPassword(dto.password);
    if (!isPasswordValid) {
      return { error: 'Invalid credentials' };
    }

    if (!user.isBeneficiary()) {
      return { error: 'Access denied' };
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email.value,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
