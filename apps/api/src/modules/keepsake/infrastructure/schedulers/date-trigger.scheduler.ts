import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeliverKeepsakeCommand } from '../../application/commands/deliver-keepsake.command';

@Injectable()
export class DateTriggerScheduler {
  private readonly logger = new Logger(DateTriggerScheduler.name);

  constructor(private readonly deliverCommand: DeliverKeepsakeCommand) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleDateTriggers(): Promise<void> {
    this.logger.log('Running scheduled date trigger check');

    try {
      const result = await this.deliverCommand.executeForDateTriggers();

      if (result.isErr()) {
        this.logger.error(`Date trigger delivery failed: ${result.error}`);
        return;
      }

      const { deliveredCount, keepsakeIds } = result.value;

      if (deliveredCount > 0) {
        this.logger.log(
          `Successfully delivered ${deliveredCount} keepsakes via date trigger: ${keepsakeIds.join(', ')}`,
        );
      } else {
        this.logger.debug('No keepsakes to deliver via date trigger');
      }
    } catch (error) {
      this.logger.error(
        `Unexpected error during date trigger processing: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
