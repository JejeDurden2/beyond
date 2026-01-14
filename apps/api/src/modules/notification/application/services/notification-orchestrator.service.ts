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
import { Beneficiary } from '@/modules/beneficiary/domain/entities/beneficiary.entity';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';
import { NotificationLog, NotificationType } from '../../domain/entities/notification-log.entity';
import { NOTIFICATION_QUEUE, NotificationJobType } from '@/shared/queue/queue.constants';
import {
  DEFAULT_TRUSTED_PERSON_DELAY_HOURS,
  DEFAULT_BENEFICIARY_DELAY_HOURS,
} from '../../notification.constants';

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
      const trustedPersonDelayHours =
        config?.trustedPersonDelayHours ?? DEFAULT_TRUSTED_PERSON_DELAY_HOURS;
      const beneficiaryDelayHours =
        config?.beneficiaryDelayHours ?? DEFAULT_BENEFICIARY_DELAY_HOURS;

      // 2. Get all beneficiaries for this vault
      const beneficiaries = await this.beneficiaryRepository.findByVaultId(input.vaultId);

      if (beneficiaries.length === 0) {
        this.logger.warn(`No beneficiaries found for vault ${input.vaultId}`);
        return ok(undefined);
      }

      const trustedPeople = beneficiaries.filter((b) => b.isTrustedPerson);
      const regularBeneficiaries = beneficiaries.filter((b) => !b.isTrustedPerson);

      // 3. Schedule trusted person alerts (one per beneficiary, not per keepsake)
      const trustedScheduled = await this.scheduleBeneficiaryNotifications(
        trustedPeople,
        input.vaultId,
        NotificationType.TRUSTED_PERSON_ALERT,
        trustedPersonDelayHours,
      );

      // 4. Schedule regular beneficiary invitations (one per beneficiary, not per keepsake)
      const regularScheduled = await this.scheduleBeneficiaryNotifications(
        regularBeneficiaries,
        input.vaultId,
        NotificationType.BENEFICIARY_INVITATION,
        beneficiaryDelayHours,
      );

      this.logger.log(
        `Scheduled ${trustedScheduled} trusted person alerts and ${regularScheduled} beneficiary invitations for vault ${input.vaultId}`,
      );

      return ok(undefined);
    } catch (error) {
      this.logger.error(`Failed to schedule notifications: ${error}`);
      return err('Failed to schedule notifications');
    }
  }

  private calculateScheduledDate(delayHours: number): Date {
    return new Date(Date.now() + delayHours * 60 * 60 * 1000);
  }

  private async scheduleBeneficiaryNotifications(
    beneficiaries: Beneficiary[],
    vaultId: string,
    type: NotificationType,
    delayHours: number,
  ): Promise<number> {
    let scheduledCount = 0;

    for (const beneficiary of beneficiaries) {
      // Check if a pending notification already exists for this beneficiary + vault
      const existingNotification = await this.logRepository.findPendingByBeneficiaryAndVault(
        beneficiary.id,
        vaultId,
      );

      if (existingNotification) {
        this.logger.log(
          `Skipping notification for beneficiary ${beneficiary.id} - pending notification already exists`,
        );
        continue;
      }

      const scheduledFor = this.calculateScheduledDate(delayHours);

      const logResult = NotificationLog.create({
        vaultId,
        beneficiaryId: beneficiary.id,
        type,
        scheduledFor,
      });

      if (logResult.isErr()) {
        this.logger.error(
          `Failed to create notification log for beneficiary ${beneficiary.id}: ${logResult.error}`,
        );
        continue;
      }

      const log = logResult.value;
      await this.logRepository.save(log);
      await this.scheduleNotificationJob(log, vaultId);

      this.logger.log(
        `Scheduled ${type} for beneficiary ${beneficiary.id} at ${scheduledFor.toISOString()}`,
      );
      scheduledCount++;
    }

    return scheduledCount;
  }

  private async scheduleNotificationJob(log: NotificationLog, vaultId: string): Promise<void> {
    const delay = log.scheduledFor.getTime() - Date.now();

    const jobData = {
      notificationLogId: log.id,
      vaultId,
      beneficiaryId: log.beneficiaryId,
      type: log.type,
    };

    if (delay <= 0) {
      // Send immediately
      await this.notificationQueue.add(NotificationJobType.SEND_EMAIL, jobData, {
        jobId: `notification-${log.id}`,
      });
    } else {
      // Schedule with delay
      await this.notificationQueue.add(NotificationJobType.SEND_EMAIL, jobData, {
        jobId: `notification-${log.id}`,
        delay,
      });
    }

    log.markAsScheduled();
    await this.logRepository.save(log);
  }
}
