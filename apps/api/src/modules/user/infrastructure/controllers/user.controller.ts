import { Controller, Patch, Post, Delete, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UpdateProfileCommand } from '../../application/commands/update-profile.command';
import { CompleteOnboardingCommand } from '../../application/commands/complete-onboarding.command';
import { ChangePasswordCommand } from '../../application/commands/change-password.command';
import { DeleteAccountCommand } from '../../application/commands/delete-account.command';
import { UploadAvatarCommand } from '../../application/commands/upload-avatar.command';
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

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@CurrentUser() user: AuthenticatedUser) {
    await this.deleteAccountCommand.execute({ userId: user.id });
  }
}
