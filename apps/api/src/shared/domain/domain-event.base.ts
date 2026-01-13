export interface IDomainEvent {
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly eventName: string;
}

export abstract class DomainEvent implements IDomainEvent {
  public readonly occurredAt: Date;
  public readonly aggregateId: string;
  public readonly eventName: string;

  constructor(aggregateId: string) {
    this.occurredAt = new Date();
    this.aggregateId = aggregateId;
    this.eventName = this.constructor.name;
  }
}
