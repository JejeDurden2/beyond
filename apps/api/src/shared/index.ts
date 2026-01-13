// Domain
export * from './domain/entity.base';
export * from './domain/aggregate-root.base';
export * from './domain/domain-event.base';
export * from './domain/domain-event-publisher.service';

// Infrastructure
export * from './infrastructure/base-repository';
export * from './infrastructure/prisma/prisma.service';

// Ports
export * from './ports/email.port';

// Adapters
export * from './adapters/console-email.adapter';

// Queue
export * from './queue/queue.constants';
export * from './queue/queue.module';

// Module
export * from './shared.module';
