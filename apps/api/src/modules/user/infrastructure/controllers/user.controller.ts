import {
  Controller,
  Patch,
  Post,
  Delete,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UpdateProfileCommand } from '../../application/commands/update-profile.command';
import { CompleteOnboardingCommand } from '../../application/commands/complete-onboarding.command';
import { ChangePasswordCommand } from '../../application/commands/change-password.command';
import { DeleteAccountCommand } from '../../application/commands/delete-account.command';
import { UploadAvatarCommand } from '../../application/commands/upload-avatar.command';
import { ExportUserDataQuery } from '../../application/queries/export-user-data.query';
import { UpdateProfileDto, ChangePasswordDto } from '../dto/user.dto';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/infrastructure/strategies/jwt.strategy';

@Controller('users')
export class UserController {
  constructor(
    private readonly updateProfileCommand: UpdateProfileCommand,
    private readonly completeOnboardingCommand: CompleteOnboardingCommand,
    private readonly changePasswordCommand: ChangePasswordCommand,
    private readonly deleteAccountCommand: DeleteAccountCommand,
    private readonly uploadAvatarCommand: UploadAvatarCommand,
    private readonly exportUserDataQuery: ExportUserDataQuery,
  ) {}

  @Patch('me')
  async updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.updateProfileCommand.execute({
      userId: user.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
  }

  @Post('me/complete-onboarding')
  @HttpCode(HttpStatus.OK)
  async completeOnboarding(@CurrentUser() user: AuthenticatedUser) {
    return this.completeOnboardingCommand.execute({ userId: user.id });
  }

  @Post('me/avatar')
  async uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { filename: string; mimeType: string },
  ) {
    return this.uploadAvatarCommand.execute({
      userId: user.id,
      filename: body.filename,
      mimeType: body.mimeType,
    });
  }

  @Post('me/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    await this.changePasswordCommand.execute({
      userId: user.id,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
    return { success: true };
  }

  /**
   * GDPR Article 20 - Right to Data Portability
   * Export all user data in a machine-readable format (JSON)
   */
  @Get('me/export')
  async exportUserData(@CurrentUser() user: AuthenticatedUser) {
    return this.exportUserDataQuery.execute({ userId: user.id });
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Query('hardDelete') hardDelete?: string,
  ) {
    // GDPR Right to Erasure: ?hardDelete=true permanently removes all data
    await this.deleteAccountCommand.execute({
      userId: user.id,
      hardDelete: hardDelete === 'true',
    });
  }
}
