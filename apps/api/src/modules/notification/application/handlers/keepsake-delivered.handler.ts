import { Injectable, Logger } from '@nestjs/common';
import { KeepsakeDeliveredEvent } from '@/modules/keepsake/domain/events';
import { NotificationOrchestratorService } from '../services/notification-orchestrator.service';

@Injectable()
export class KeepsakeDeliveredHandler {
  private readonly logger = new Logger(KeepsakeDeliveredHandler.name);

  constructor(private readonly orchestrator: NotificationOrchestratorService) {}

  async handle(event: KeepsakeDeliveredEvent): Promise<void> {
    this.logger.log(
      `Handling KeepsakeDeliveredEvent for keepsake ${event.keepsakeId} (vault: ${event.vaultId}, trigger: ${event.triggerCondition})`,
    );

    const result = await this.orchestrator.scheduleNotificationsForKeepsake({
      keepsakeId: event.keepsakeId,
      vaultId: event.vaultId,
    });

    if (result.isErr()) {
      this.logger.error(`Failed to schedule notifications: ${result.error}`);
      // Don't throw - we don't want to fail the delivery if notification scheduling fails
      // The keepsake is still delivered, just notifications might be delayed
    } else {
      this.logger.log(`Successfully scheduled notifications for keepsake ${event.keepsakeId}`);
    }
  }
}
