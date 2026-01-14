import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  INotificationLogRepository,
  NOTIFICATION_LOG_REPOSITORY,
} from '../../domain/repositories/notification-log.repository';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '@/modules/beneficiary/domain/repositories/beneficiary.repository';
import {
  IBeneficiaryInvitationRepository,
  BENEFICIARY_INVITATION_REPOSITORY,
} from '@/modules/beneficiary/domain/repositories/beneficiary-invitation.repository';
import { BeneficiaryInvitation } from '@/modules/beneficiary/domain/entities/beneficiary-invitation.entity';
import {
  KeepsakeAssignmentRepository,
  KEEPSAKE_ASSIGNMENT_REPOSITORY,
} from '@/modules/keepsake-assignment/domain/repositories/keepsake-assignment.repository';
import {
  UserRepository,
  USER_REPOSITORY,
} from '@/modules/auth/domain/repositories/user.repository';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';
import { IEmailService, EMAIL_SERVICE } from '@/shared/ports/email.port';
import { NotificationType } from '../../domain/entities/notification-log.entity';
import { NOTIFICATION_QUEUE } from '@/shared/queue/queue.constants';
import { DEFAULT_EMAIL_LOCALE } from '../../notification.constants';

interface NotificationJobData {
  notificationLogId: string;
  vaultId: string;
  beneficiaryId?: string | null;
  type: NotificationType;
}

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject(NOTIFICATION_LOG_REPOSITORY)
    private readonly logRepository: INotificationLogRepository,
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(BENEFICIARY_INVITATION_REPOSITORY)
    private readonly invitationRepository: IBeneficiaryInvitationRepository,
    @Inject(KEEPSAKE_ASSIGNMENT_REPOSITORY)
    private readonly keepsakeAssignmentRepository: KeepsakeAssignmentRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    this.logger.log(`Processing notification job ${job.id} (type: ${job.data.type})`);

    const { notificationLogId, vaultId, beneficiaryId, type } = job.data;

    // Get notification log
    const log = await this.logRepository.findById(notificationLogId);
    if (!log) {
      this.logger.error(`Notification log ${notificationLogId} not found`);
      throw new Error('Notification log not found');
    }

    try {
      switch (type) {
        case NotificationType.TRUSTED_PERSON_ALERT:
        case NotificationType.BENEFICIARY_INVITATION:
        case NotificationType.ACCOUNT_CREATION:
          if (!beneficiaryId) {
            throw new Error(`Beneficiary ID required for notification type ${type}`);
          }
          break;
      }

      switch (type) {
        case NotificationType.TRUSTED_PERSON_ALERT:
          await this.sendTrustedPersonAlert(beneficiaryId as string, vaultId);
          break;

        case NotificationType.BENEFICIARY_INVITATION:
          await this.sendBeneficiaryInvitation(beneficiaryId as string, vaultId);
          break;

        case NotificationType.ACCOUNT_CREATION:
          await this.sendAccountCreationEmail(beneficiaryId as string);
          break;

        default:
          throw new Error(`Unknown notification type: ${type}`);
      }

      log.markAsSent();
      await this.logRepository.save(log);

      this.logger.log(`Successfully sent notification ${notificationLogId}`);
    } catch (error) {
      this.logger.error(`Failed to send notification ${notificationLogId}: ${error}`);

      const failResult = log.markAsFailed(error instanceof Error ? error.message : String(error));
      await this.logRepository.save(log);

      if (failResult.isErr()) {
        // Max retries reached
        this.logger.error(
          `Notification ${notificationLogId} failed permanently: ${failResult.error}`,
        );
      } else {
        // Will retry
        throw error;
      }
    }
  }

  private async sendTrustedPersonAlert(beneficiaryId: string, vaultId: string): Promise<void> {
    const beneficiary = await this.beneficiaryRepository.findById(beneficiaryId);
    if (!beneficiary) {
      throw new Error(`Beneficiary ${beneficiaryId} not found`);
    }

    const vault = await this.vaultRepository.findById(vaultId);
    if (!vault) {
      throw new Error(`Vault ${vaultId} not found`);
    }

    const vaultOwner = await this.userRepository.findById(vault.userId);
    if (!vaultOwner) {
      throw new Error(`Vault owner ${vault.userId} not found`);
    }

    // Get keepsake count for this beneficiary
    const assignments = await this.keepsakeAssignmentRepository.findByBeneficiaryId(beneficiaryId);
    const keepsakeCount = assignments.length;

    // Create or get existing invitation
    const invitation = await this.getOrCreateInvitation(beneficiaryId);

    const vaultOwnerName =
      vaultOwner.firstName && vaultOwner.lastName
        ? `${vaultOwner.firstName} ${vaultOwner.lastName}`
        : vaultOwner.email.value;

    await this.emailService.sendTrustedPersonAlert({
      to: beneficiary.email,
      trustedPersonName: beneficiary.fullName,
      vaultOwnerName,
      invitationToken: invitation.token,
      keepsakeCount,
      locale: DEFAULT_EMAIL_LOCALE,
    });
  }

  private async sendBeneficiaryInvitation(beneficiaryId: string, vaultId: string): Promise<void> {
    const beneficiary = await this.beneficiaryRepository.findById(beneficiaryId);
    if (!beneficiary) {
      throw new Error(`Beneficiary ${beneficiaryId} not found`);
    }

    const vault = await this.vaultRepository.findById(vaultId);
    if (!vault) {
      throw new Error(`Vault ${vaultId} not found`);
    }

    const vaultOwner = await this.userRepository.findById(vault.userId);
    if (!vaultOwner) {
      throw new Error(`Vault owner ${vault.userId} not found`);
    }

    // Get keepsake count for this beneficiary
    const assignments = await this.keepsakeAssignmentRepository.findByBeneficiaryId(beneficiaryId);
    const keepsakeCount = assignments.length;

    // Create or get existing invitation
    const invitation = await this.getOrCreateInvitation(beneficiaryId);

    const senderName =
      vaultOwner.firstName && vaultOwner.lastName
        ? `${vaultOwner.firstName} ${vaultOwner.lastName}`
        : vaultOwner.email.value;

    await this.emailService.sendBeneficiaryInvitation({
      to: beneficiary.email,
      beneficiaryName: beneficiary.fullName,
      senderName,
      invitationToken: invitation.token,
      keepsakeCount,
      locale: DEFAULT_EMAIL_LOCALE,
    });
  }

  private async getOrCreateInvitation(beneficiaryId: string): Promise<BeneficiaryInvitation> {
    // Check for existing pending invitation
    const existingInvitations = await this.invitationRepository.findByBeneficiaryId(beneficiaryId);
    const pendingInvitation = existingInvitations.find(
      (inv) => inv.status === 'PENDING' && !inv.isExpired(),
    );

    if (pendingInvitation) {
      return pendingInvitation;
    }

    // Create new invitation (invitations are per-beneficiary, not per-keepsake)
    const invitationResult = BeneficiaryInvitation.create({
      beneficiaryId,
      expiresInDays: 30,
    });

    if (invitationResult.isErr()) {
      throw new Error(`Failed to create invitation: ${invitationResult.error}`);
    }

    const invitation = invitationResult.value;
    await this.invitationRepository.save(invitation);

    return invitation;
  }

  private async sendAccountCreationEmail(beneficiaryId: string): Promise<void> {
    const beneficiary = await this.beneficiaryRepository.findById(beneficiaryId);
    if (!beneficiary) {
      throw new Error(`Beneficiary ${beneficiaryId} not found`);
    }

    await this.emailService.sendBeneficiaryAccountCreated({
      to: beneficiary.email,
      beneficiaryName: beneficiary.fullName,
      locale: DEFAULT_EMAIL_LOCALE,
    });
  }
}
