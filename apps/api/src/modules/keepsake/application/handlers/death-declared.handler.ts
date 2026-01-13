import { Injectable, Logger } from '@nestjs/common';
import { DeathDeclaredEvent } from '@/modules/vault/domain/events/death-declared.event';
import { DeliverKeepsakeCommand } from '../commands/deliver-keepsake.command';

@Injectable()
export class DeathDeclaredHandler {
  private readonly logger = new Logger(DeathDeclaredHandler.name);

  constructor(private readonly deliverCommand: DeliverKeepsakeCommand) {}

  async handle(event: DeathDeclaredEvent): Promise<void> {
    this.logger.log(
      `Handling DeathDeclaredEvent for vault ${event.vaultId} (declared by trusted contact ${event.trustedContactId})`,
    );

    const result = await this.deliverCommand.executeForDeathTrigger(event.vaultId);

    if (result.isErr()) {
      this.logger.error(`Failed to deliver death-triggered keepsakes: ${result.error}`);
      // Don't throw - we don't want to fail the death declaration if delivery fails
      // The keepsakes can be retried later
    } else {
      const { deliveredCount, keepsakeIds } = result.value;
      this.logger.log(
        `Successfully delivered ${deliveredCount} keepsakes for vault ${event.vaultId}: ${keepsakeIds.join(', ')}`,
      );
    }
  }
}
