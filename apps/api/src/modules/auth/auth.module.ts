import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthController } from './infrastructure/controllers/auth.controller';
import { PrismaUserRepository } from './infrastructure/adapters/prisma-user.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

import { RegisterCommand } from './application/commands/register.command';
import { VerifyEmailCommand } from './application/commands/verify-email.command';
import { LoginQuery } from './application/queries/login.query';
import { GetCurrentUserQuery } from './application/queries/get-current-user.query';

import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { VaultModule } from '../vault/vault.module';

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
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    RegisterCommand,
    VerifyEmailCommand,
    LoginQuery,
    GetCurrentUserQuery,
  ],
  exports: [USER_REPOSITORY, JwtModule],
})
export class AuthModule {}
