import { AggregateRoot } from '@/shared/domain';
import { Result, ok, err } from 'neverthrow';

export interface NotificationConfigProps {
  id?: string;
  vaultId: string;
  trustedPersonDelayHours: number;
  beneficiaryDelayHours: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class NotificationConfig extends AggregateRoot<NotificationConfigProps> {
  private static readonly DEFAULT_TRUSTED_PERSON_DELAY_HOURS = 72;
  private static readonly DEFAULT_BENEFICIARY_DELAY_HOURS = 168;
  private static readonly MIN_DELAY_HOURS = 0;
  private static readonly MAX_DELAY_HOURS = 8760; // 1 year

  private constructor(props: NotificationConfigProps) {
    super(props);
  }

  static create(vaultId: string): Result<NotificationConfig, string> {
    if (!vaultId) {
      return err('Vault ID is required');
    }

    return ok(
      new NotificationConfig({
        vaultId,
        trustedPersonDelayHours: this.DEFAULT_TRUSTED_PERSON_DELAY_HOURS,
        beneficiaryDelayHours: this.DEFAULT_BENEFICIARY_DELAY_HOURS,
      }),
    );
  }

  static reconstitute(props: NotificationConfigProps): NotificationConfig {
    return new NotificationConfig(props);
  }

  updateTrustedPersonDelay(hours: number): Result<void, string> {
    if (hours < NotificationConfig.MIN_DELAY_HOURS || hours > NotificationConfig.MAX_DELAY_HOURS) {
      return err(
        `Trusted person delay must be between ${NotificationConfig.MIN_DELAY_HOURS} and ${NotificationConfig.MAX_DELAY_HOURS} hours`,
      );
    }

    this.props.trustedPersonDelayHours = hours;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  updateBeneficiaryDelay(hours: number): Result<void, string> {
    if (hours < NotificationConfig.MIN_DELAY_HOURS || hours > NotificationConfig.MAX_DELAY_HOURS) {
      return err(
        `Beneficiary delay must be between ${NotificationConfig.MIN_DELAY_HOURS} and ${NotificationConfig.MAX_DELAY_HOURS} hours`,
      );
    }

    this.props.beneficiaryDelayHours = hours;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  get vaultId(): string {
    return this.props.vaultId;
  }

  get trustedPersonDelayHours(): number {
    return this.props.trustedPersonDelayHours;
  }

  get beneficiaryDelayHours(): number {
    return this.props.beneficiaryDelayHours;
  }
}
