import { AggregateRoot } from '../domain/aggregate-root.base';
import { DomainEventPublisher } from '../domain/domain-event-publisher.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class BaseRepository<T extends AggregateRoot<any>> {
  constructor(protected readonly eventPublisher: DomainEventPublisher) {}

  protected async publishEvents(aggregate: T): Promise<void> {
    const events = aggregate.pullDomainEvents();
    if (events.length > 0) {
      await this.eventPublisher.publish(events);
    }
  }
}
