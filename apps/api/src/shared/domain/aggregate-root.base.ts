import { Entity, EntityProps } from './entity.base';
import { DomainEvent } from './domain-event.base';

export abstract class AggregateRoot<T extends EntityProps> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  constructor(props: T) {
    super(props);
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  public get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }
}
