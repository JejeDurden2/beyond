import { AggregateRoot } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';

export enum NotificationType {
  TRUSTED_PERSON_ALERT = 'trusted_person_alert',
  BENEFICIARY_INVITATION = 'beneficiary_invitation',
  ACCOUNT_CREATION = 'account_creation',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface NotificationLogProps {
  id?: string;
  keepsakeId?: string | null;
  beneficiaryId?: string | null;
  vaultId?: string | null;
  type: NotificationType;
  status: NotificationStatus;
  scheduledFor: Date;
  sentAt?: Date | null;
  failureReason?: string | null;
  retryCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateNotificationLogInput {
  keepsakeId?: string | null;
  beneficiaryId?: string | null;
  vaultId?: string | null;
  type: NotificationType;
  scheduledFor: Date;
}

export class NotificationLog extends AggregateRoot<NotificationLogProps> {
  private static readonly MAX_RETRY_COUNT = 3;

  private constructor(props: NotificationLogProps) {
    super(props);
  }

  static create(input: CreateNotificationLogInput): Result<NotificationLog, string> {
    if (!input.type) {
      return err('Notification type is required');
    }

    if (!input.scheduledFor) {
      return err('Scheduled date is required');
    }

    // Either keepsakeId or vaultId must be provided
    if (!input.keepsakeId && !input.vaultId) {
      return err('Either keepsakeId or vaultId is required');
    }

    return ok(
      new NotificationLog({
        keepsakeId: input.keepsakeId ?? null,
        beneficiaryId: input.beneficiaryId ?? null,
        vaultId: input.vaultId ?? null,
        type: input.type,
        status: NotificationStatus.PENDING,
        scheduledFor: input.scheduledFor,
        sentAt: null,
        failureReason: null,
        retryCount: 0,
      }),
    );
  }

  static reconstitute(props: NotificationLogProps): NotificationLog {
    return new NotificationLog(props);
  }

  markAsScheduled(): void {
    this.props.status = NotificationStatus.SCHEDULED;
    this._updatedAt = new Date();
  }

  markAsSent(): void {
    this.props.status = NotificationStatus.SENT;
    this.props.sentAt = new Date();
    this._updatedAt = new Date();
  }

  markAsFailed(reason: string): Result<void, string> {
    this.props.status = NotificationStatus.FAILED;
    this.props.failureReason = reason;
    this.props.retryCount += 1;
    this._updatedAt = new Date();

    if (this.props.retryCount >= NotificationLog.MAX_RETRY_COUNT) {
      return err('Maximum retry count reached');
    }

    return ok(undefined);
  }

  cancel(): void {
    this.props.status = NotificationStatus.CANCELLED;
    this._updatedAt = new Date();
  }

  canRetry(): boolean {
    return (
      this.props.status === NotificationStatus.FAILED &&
      this.props.retryCount < NotificationLog.MAX_RETRY_COUNT
    );
  }

  get keepsakeId(): string | null {
    return this.props.keepsakeId ?? null;
  }

  get beneficiaryId(): string | null {
    return this.props.beneficiaryId ?? null;
  }

  get vaultId(): string | null {
    return this.props.vaultId ?? null;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get status(): NotificationStatus {
    return this.props.status;
  }

  get scheduledFor(): Date {
    return this.props.scheduledFor;
  }

  get sentAt(): Date | null {
    return this.props.sentAt ?? null;
  }

  get failureReason(): string | null {
    return this.props.failureReason ?? null;
  }

  get retryCount(): number {
    return this.props.retryCount;
  }
}
