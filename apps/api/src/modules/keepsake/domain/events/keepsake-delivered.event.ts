import { DomainEvent } from '@/shared/domain';
import { TriggerCondition } from '../entities/keepsake.entity';

export interface KeepsakeDeliveredEventPayload {
  keepsakeId: string;
  vaultId: string;
  triggerCondition: TriggerCondition;
  occurredAt: Date;
}

export class KeepsakeDeliveredEvent extends DomainEvent {
  public readonly keepsakeId: string;
  public readonly vaultId: string;
  public readonly triggerCondition: TriggerCondition;

  constructor(payload: KeepsakeDeliveredEventPayload) {
    super(payload.keepsakeId);
    this.keepsakeId = payload.keepsakeId;
    this.vaultId = payload.vaultId;
    this.triggerCondition = payload.triggerCondition;
  }

  static create(
    keepsakeId: string,
    vaultId: string,
    triggerCondition: TriggerCondition,
  ): KeepsakeDeliveredEvent {
    return new KeepsakeDeliveredEvent({
      keepsakeId,
      vaultId,
      triggerCondition,
      occurredAt: new Date(),
    });
  }
}
