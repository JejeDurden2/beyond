import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterCommand } from '../../application/commands/register.command';
import { VerifyEmailCommand } from '../../application/commands/verify-email.command';
import { LoginQuery } from '../../application/queries/login.query';
import { GetCurrentUserQuery } from '../../application/queries/get-current-user.query';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerCommand: RegisterCommand,
    private readonly verifyEmailCommand: VerifyEmailCommand,
    private readonly loginQuery: LoginQuery,
    private readonly getCurrentUserQuery: GetCurrentUserQuery,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerCommand.execute(dto);
    return {
      id: result.id,
      email: result.email,
    };
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
}
