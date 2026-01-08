import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { RegisterCommand } from '../../application/commands/register.command';
import { VerifyEmailCommand } from '../../application/commands/verify-email.command';
import { ForgotPasswordCommand } from '../../application/commands/forgot-password.command';
import { ResetPasswordCommand } from '../../application/commands/reset-password.command';
import { LoginQuery } from '../../application/queries/login.query';
import { GetCurrentUserQuery } from '../../application/queries/get-current-user.query';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerCommand: RegisterCommand,
    private readonly verifyEmailCommand: VerifyEmailCommand,
    private readonly forgotPasswordCommand: ForgotPasswordCommand,
    private readonly resetPasswordCommand: ResetPasswordCommand,
    private readonly loginQuery: LoginQuery,
    private readonly getCurrentUserQuery: GetCurrentUserQuery,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerCommand.execute(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.loginQuery.execute(dto);
  }

  @Public()
  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.verifyEmailCommand.execute({ token });
  }

  @Get('me')
  async getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    return this.getCurrentUserQuery.execute({ userId: user.id });
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.forgotPasswordCommand.execute(dto);
    // Always return success to prevent email enumeration
    return { message: 'If an account exists with this email, a reset link has been sent.' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.resetPasswordCommand.execute(dto);

    if (result.isErr()) {
      throw new BadRequestException(result.error);
    }

    return { message: 'Password has been reset successfully.' };
  }
}
