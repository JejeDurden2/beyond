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
  keepsakeId: string;
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

    const { notificationLogId, beneficiaryId, type } = job.data;

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
          await this.sendTrustedPersonAlert(beneficiaryId as string);
          break;

        case NotificationType.BENEFICIARY_INVITATION:
          await this.sendBeneficiaryInvitation(beneficiaryId as string);
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

  private async sendTrustedPersonAlert(beneficiaryId: string): Promise<void> {
    const beneficiary = await this.beneficiaryRepository.findById(beneficiaryId);
    if (!beneficiary) {
      throw new Error(`Beneficiary ${beneficiaryId} not found`);
    }

    const vault = await this.vaultRepository.findById(beneficiary.vaultId);
    if (!vault) {
      throw new Error(`Vault ${beneficiary.vaultId} not found`);
    }

    const vaultOwner = await this.userRepository.findById(vault.userId);
    if (!vaultOwner) {
      throw new Error(`Vault owner ${vault.userId} not found`);
    }

    const vaultOwnerName =
      vaultOwner.firstName && vaultOwner.lastName
        ? `${vaultOwner.firstName} ${vaultOwner.lastName}`
        : vaultOwner.email.value;

    await this.emailService.sendTrustedPersonAlert({
      to: beneficiary.email,
      vaultOwnerName,
      locale: DEFAULT_EMAIL_LOCALE,
    });
  }

  private async sendBeneficiaryInvitation(beneficiaryId: string): Promise<void> {
    const beneficiary = await this.beneficiaryRepository.findById(beneficiaryId);
    if (!beneficiary) {
      throw new Error(`Beneficiary ${beneficiaryId} not found`);
    }

    // Generate invitation token if not already generated
    if (!beneficiary.invitationToken) {
      beneficiary.generateInvitationToken();
      await this.beneficiaryRepository.save(beneficiary);
    }

    const vault = await this.vaultRepository.findById(beneficiary.vaultId);
    if (!vault) {
      throw new Error(`Vault ${beneficiary.vaultId} not found`);
    }

    const vaultOwner = await this.userRepository.findById(vault.userId);
    if (!vaultOwner) {
      throw new Error(`Vault owner ${vault.userId} not found`);
    }

    const senderName =
      vaultOwner.firstName && vaultOwner.lastName
        ? `${vaultOwner.firstName} ${vaultOwner.lastName}`
        : vaultOwner.email.value;

    await this.emailService.sendBeneficiaryInvitation({
      to: beneficiary.email,
      beneficiaryName: beneficiary.fullName,
      senderName,
      invitationToken: beneficiary.invitationToken!,
      locale: DEFAULT_EMAIL_LOCALE,
    });
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
