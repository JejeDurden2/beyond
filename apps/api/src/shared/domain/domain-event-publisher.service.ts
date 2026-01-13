import { Injectable, Logger, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DomainEvent } from './domain-event.base';

interface EventHandler<T extends DomainEvent = DomainEvent> {
  handle(event: T): Promise<void>;
}

@Injectable()
export class DomainEventPublisher {
  private readonly logger = new Logger(DomainEventPublisher.name);
  private readonly handlers = new Map<string, Type<EventHandler>[]>();

  constructor(private readonly moduleRef: ModuleRef) {}

  register<T extends DomainEvent>(eventName: string, handler: Type<EventHandler<T>>): void {
    const existingHandlers = this.handlers.get(eventName) ?? [];
    this.handlers.set(eventName, [...existingHandlers, handler]);
  }

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publishSingleEvent(event);
    }
  }

  private async publishSingleEvent(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) ?? [];

    for (const HandlerClass of handlers) {
      try {
        const handler = this.moduleRef.get(HandlerClass, { strict: false });
        await handler.handle(event);
      } catch (error) {
        this.logger.error(
          `Error handling event ${event.eventName}: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }
}
