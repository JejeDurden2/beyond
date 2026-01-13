import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../../auth/domain/repositories/user.repository';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';

export interface DeleteAccountCommandInput {
  userId: string;
  hardDelete?: boolean; // GDPR Right to Erasure - permanently delete all data
}

@Injectable()
export class DeleteAccountCommand {
  private readonly logger = new Logger(DeleteAccountCommand.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: DeleteAccountCommandInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (input.hardDelete) {
      await this.performHardDelete(input.userId);
      this.logger.log(`User ${input.userId} permanently deleted (GDPR erasure)`);
    } else {
      user.softDelete();
      await this.userRepository.save(user);
      this.logger.log(`User ${input.userId} soft deleted`);
    }
  }

  /**
   * GDPR Article 17 - Right to Erasure
   * Permanently deletes all user data including:
   * - User account
   * - Vault and all keepsakes
   * - Beneficiaries and assignments
   * - Notifications and logs
   * - Secure files
   * - Password reset tokens
   * - Trusted contacts
   */
  private async performHardDelete(userId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Get vault ID for cascade deletion
      const vault = await tx.vault.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (vault) {
        // Delete notification logs (references keepsakes and beneficiaries)
        await tx.notificationLog.deleteMany({
          where: { keepsake: { vaultId: vault.id } },
        });

        // Delete notification config
        await tx.notificationConfig.deleteMany({
          where: { vaultId: vault.id },
        });

        // Delete beneficiary portal access
        await tx.beneficiaryPortalAccess.deleteMany({
          where: { beneficiary: { vaultId: vault.id } },
        });

        // Delete beneficiary invitations
        await tx.beneficiaryInvitation.deleteMany({
          where: { beneficiary: { vaultId: vault.id } },
        });

        // Delete keepsake assignments
        await tx.keepsakeAssignment.deleteMany({
          where: { keepsake: { vaultId: vault.id } },
        });

        // Delete keepsake media
        await tx.keepsakeMedia.deleteMany({
          where: { keepsake: { vaultId: vault.id } },
        });

        // Delete keepsakes
        await tx.keepsake.deleteMany({
          where: { vaultId: vault.id },
        });

        // Delete beneficiaries
        await tx.beneficiary.deleteMany({
          where: { vaultId: vault.id },
        });

        // Delete death declarations
        await tx.deathDeclaration.deleteMany({
          where: { vaultId: vault.id },
        });

        // Delete vault
        await tx.vault.delete({
          where: { id: vault.id },
        });
      }

      // Delete beneficiary profile (if user was also a beneficiary)
      await tx.beneficiaryProfile.deleteMany({
        where: { userId },
      });

      // Delete trusted contacts
      await tx.trustedContact.deleteMany({
        where: { userId },
      });

      // Delete password reset tokens
      await tx.passwordResetToken.deleteMany({
        where: { userId },
      });

      // Delete secure files
      await tx.secureFile.deleteMany({
        where: { ownerId: userId },
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });
  }
}
