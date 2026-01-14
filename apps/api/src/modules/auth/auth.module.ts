import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthController } from './infrastructure/controllers/auth.controller';
import { PrismaUserRepository } from './infrastructure/adapters/prisma-user.repository';
import { PrismaPasswordResetTokenRepository } from './infrastructure/adapters/prisma-password-reset-token.repository';
import { ConsoleEmailService } from './infrastructure/adapters/console-email.service';
import { ResendEmailService } from './infrastructure/adapters/resend-email.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

import { RegisterCommand } from './application/commands/register.command';
import { VerifyEmailCommand } from './application/commands/verify-email.command';
import { ForgotPasswordCommand } from './application/commands/forgot-password.command';
import { ResetPasswordCommand } from './application/commands/reset-password.command';
import { LoginQuery } from './application/queries/login.query';
import { GetCurrentUserQuery } from './application/queries/get-current-user.query';

import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from './domain/repositories/password-reset-token.repository';
import { EMAIL_SERVICE } from './domain/ports/email.service';
import { VaultModule } from '../vault/vault.module';
import { BeneficiaryModule } from '../beneficiary/beneficiary.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '15m') },
      }),
    }),
    forwardRef(() => VaultModule),
    forwardRef(() => BeneficiaryModule),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: PASSWORD_RESET_TOKEN_REPOSITORY,
      useClass: PrismaPasswordResetTokenRepository,
    },
    {
      provide: EMAIL_SERVICE,
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV');
        const resendApiKey = configService.get<string>('RESEND_API_KEY');

        // Use Resend in production or if RESEND_API_KEY is set
        if (nodeEnv === 'production' || resendApiKey) {
          return new ResendEmailService(configService);
        }

        // Default to console adapter for development
        return new ConsoleEmailService();
      },
      inject: [ConfigService],
    },
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    RegisterCommand,
    VerifyEmailCommand,
    ForgotPasswordCommand,
    ResetPasswordCommand,
    LoginQuery,
    GetCurrentUserQuery,
  ],
  exports: [USER_REPOSITORY, JwtModule, EMAIL_SERVICE],
})
export class AuthModule {}
