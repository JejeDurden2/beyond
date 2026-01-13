import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UserController } from './infrastructure/controllers/user.controller';
import { UpdateProfileCommand } from './application/commands/update-profile.command';
import { CompleteOnboardingCommand } from './application/commands/complete-onboarding.command';
import { ChangePasswordCommand } from './application/commands/change-password.command';
import { DeleteAccountCommand } from './application/commands/delete-account.command';
import { UploadAvatarCommand } from './application/commands/upload-avatar.command';
import { ExportUserDataQuery } from './application/queries/export-user-data.query';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [UserController],
  providers: [
    UpdateProfileCommand,
    CompleteOnboardingCommand,
    ChangePasswordCommand,
    DeleteAccountCommand,
    UploadAvatarCommand,
    ExportUserDataQuery,
  ],
})
export class UserModule {}
