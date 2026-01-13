import { Global, Module } from '@nestjs/common';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { DomainEventPublisher } from './domain/domain-event-publisher.service';

@Global()
@Module({
  providers: [PrismaService, DomainEventPublisher],
  exports: [PrismaService, DomainEventPublisher],
})
export class SharedModule {}
