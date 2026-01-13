import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Result, ok, err } from 'neverthrow';
import {
  INotificationConfigRepository,
  NOTIFICATION_CONFIG_REPOSITORY,
} from '../../domain/repositories/notification-config.repository';
import {
  INotificationLogRepository,
  NOTIFICATION_LOG_REPOSITORY,
} from '../../domain/repositories/notification-log.repository';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '@/modules/beneficiary/domain/repositories/beneficiary.repository';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';
import { NotificationLog, NotificationType } from '../../domain/entities/notification-log.entity';
import { NOTIFICATION_QUEUE, NotificationJobType } from '@/shared/queue/queue.constants';

export interface ScheduleNotificationsForKeepsakeInput {
  keepsakeId: string;
  vaultId: string;
}

@Injectable()
export class NotificationOrchestratorService {
  private readonly logger = new Logger(NotificationOrchestratorService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
    @Inject(NOTIFICATION_CONFIG_REPOSITORY)
    private readonly configRepository: INotificationConfigRepository,
    @Inject(NOTIFICATION_LOG_REPOSITORY)
    private readonly logRepository: INotificationLogRepository,
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
  ) {}

  async scheduleNotificationsForKeepsake(
    input: ScheduleNotificationsForKeepsakeInput,
  ): Promise<Result<void, string>> {
    try {
      // 1. Get vault and config
      const vault = await this.vaultRepository.findById(input.vaultId);
      if (!vault) {
        return err('Vault not found');
      }

      const config = await this.configRepository.findByVaultId(input.vaultId);
      const trustedPersonDelayHours = config?.trustedPersonDelayHours ?? 72;
      const beneficiaryDelayHours = config?.beneficiaryDelayHours ?? 168;

      // 2. Get all beneficiaries for this vault
      const beneficiaries = await this.beneficiaryRepository.findByVaultId(input.vaultId);

      if (beneficiaries.length === 0) {
        this.logger.warn(`No beneficiaries found for vault ${input.vaultId}`);
        return ok(undefined);
      }

      const trustedPeople = beneficiaries.filter((b) => b.isTrustedPerson);
      const regularBeneficiaries = beneficiaries.filter((b) => !b.isTrustedPerson);

      // 3. Schedule trusted person alerts (immediate or with short delay)
      for (const trustedPerson of trustedPeople) {
        const scheduledFor = this.calculateScheduledDate(trustedPersonDelayHours);

        const logResult = NotificationLog.create({
          keepsakeId: input.keepsakeId,
          beneficiaryId: trustedPerson.id,
          type: NotificationType.TRUSTED_PERSON_ALERT,
          scheduledFor,
        });

        if (logResult.isErr()) {
          this.logger.error(`Failed to create notification log: ${logResult.error}`);
          continue;
        }

        const log = logResult.value;
        await this.logRepository.save(log);

        // Schedule job in BullMQ
        await this.scheduleNotificationJob(log);

        this.logger.log(
          `Scheduled trusted person alert for beneficiary ${trustedPerson.id} at ${scheduledFor.toISOString()}`,
        );
      }

      // 4. Schedule regular beneficiary invitations (with longer delay)
      for (const beneficiary of regularBeneficiaries) {
        const scheduledFor = this.calculateScheduledDate(beneficiaryDelayHours);

        const logResult = NotificationLog.create({
          keepsakeId: input.keepsakeId,
          beneficiaryId: beneficiary.id,
          type: NotificationType.BENEFICIARY_INVITATION,
          scheduledFor,
        });

        if (logResult.isErr()) {
          this.logger.error(`Failed to create notification log: ${logResult.error}`);
          continue;
        }

        const log = logResult.value;
        await this.logRepository.save(log);

        // Schedule job in BullMQ
        await this.scheduleNotificationJob(log);

        this.logger.log(
          `Scheduled beneficiary invitation for beneficiary ${beneficiary.id} at ${scheduledFor.toISOString()}`,
        );
      }

      this.logger.log(
        `Scheduled ${trustedPeople.length} trusted person alerts and ${regularBeneficiaries.length} beneficiary invitations for keepsake ${input.keepsakeId}`,
      );

      return ok(undefined);
    } catch (error) {
      this.logger.error(`Failed to schedule notifications: ${error}`);
      return err('Failed to schedule notifications');
    }
  }

  private calculateScheduledDate(delayHours: number): Date {
    const now = new Date();
    const scheduledDate = new Date(now.getTime() + delayHours * 60 * 60 * 1000);
    return scheduledDate;
  }

  private async scheduleNotificationJob(log: NotificationLog): Promise<void> {
    const delay = log.scheduledFor.getTime() - Date.now();

    if (delay <= 0) {
      // Send immediately
      await this.notificationQueue.add(
        NotificationJobType.SEND_EMAIL,
        {
          notificationLogId: log.id,
          keepsakeId: log.keepsakeId,
          beneficiaryId: log.beneficiaryId,
          type: log.type,
        },
        {
          jobId: `notification-${log.id}`,
        },
      );
    } else {
      // Schedule with delay
      await this.notificationQueue.add(
        NotificationJobType.SEND_EMAIL,
        {
          notificationLogId: log.id,
          keepsakeId: log.keepsakeId,
          beneficiaryId: log.beneficiaryId,
          type: log.type,
        },
        {
          jobId: `notification-${log.id}`,
          delay,
        },
      );
    }

    log.markAsScheduled();
    await this.logRepository.save(log);
  }
}
