import { AggregateRoot } from '../domain/aggregate-root.base';
import { DomainEventPublisher } from '../domain/domain-event-publisher.service';
import { EntityProps } from '../domain/entity.base';

export abstract class BaseRepository<T extends AggregateRoot<EntityProps>> {
  constructor(protected readonly eventPublisher: DomainEventPublisher) {}

  protected async publishEvents(aggregate: T): Promise<void> {
    const events = aggregate.pullDomainEvents();
    if (events.length > 0) {
      await this.eventPublisher.publish(events);
    }
  }
}
