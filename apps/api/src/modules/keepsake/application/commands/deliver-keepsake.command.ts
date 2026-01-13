import { Injectable, Inject, Logger } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  KEEPSAKE_REPOSITORY,
  KeepsakeRepository,
} from '../../domain/repositories/keepsake.repository';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';
import { Keepsake, TriggerCondition, KeepsakeStatus } from '../../domain/entities/keepsake.entity';

export interface DeliverKeepsakeResult {
  deliveredCount: number;
  keepsakeIds: string[];
}

@Injectable()
export class DeliverKeepsakeCommand {
  private readonly logger = new Logger(DeliverKeepsakeCommand.name);

  constructor(
    @Inject(KEEPSAKE_REPOSITORY)
    private readonly keepsakeRepository: KeepsakeRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
  ) {}

  async executeForDeathTrigger(vaultId: string): Promise<Result<DeliverKeepsakeResult, string>> {
    this.logger.log(`Executing death trigger delivery for vault ${vaultId}`);

    const vault = await this.vaultRepository.findById(vaultId);
    if (!vault) {
      return err(`Vault with ID ${vaultId} not found`);
    }

    const keepsakes = await this.keepsakeRepository.findByVaultId(vaultId, {
      status: KeepsakeStatus.SCHEDULED,
    });
    const deathTriggeredKeepsakes = keepsakes.filter(
      (k) => k.triggerCondition === TriggerCondition.ON_DEATH,
    );

    if (deathTriggeredKeepsakes.length === 0) {
      this.logger.log(`No death-triggered keepsakes found for vault ${vaultId}`);
      return ok({ deliveredCount: 0, keepsakeIds: [] });
    }

    const deliveredIds = await this.deliverKeepsakes(deathTriggeredKeepsakes, 'death trigger');

    this.logger.log(
      `Completed death trigger delivery for vault ${vaultId}: ${deliveredIds.length}/${deathTriggeredKeepsakes.length} keepsakes delivered`,
    );

    return ok({
      deliveredCount: deliveredIds.length,
      keepsakeIds: deliveredIds,
    });
  }

  async executeForDateTriggers(): Promise<Result<DeliverKeepsakeResult, string>> {
    this.logger.log('Executing date-based trigger delivery');

    const keepsakes = await this.keepsakeRepository.findScheduledByTriggerAndDate(
      TriggerCondition.ON_DATE,
      new Date(),
    );

    if (keepsakes.length === 0) {
      this.logger.log('No date-triggered keepsakes found for delivery');
      return ok({ deliveredCount: 0, keepsakeIds: [] });
    }

    this.logger.log(`Found ${keepsakes.length} date-triggered keepsakes to deliver`);

    const deliveredIds = await this.deliverKeepsakes(keepsakes, 'date trigger');

    this.logger.log(
      `Completed date trigger delivery: ${deliveredIds.length}/${keepsakes.length} keepsakes delivered`,
    );

    return ok({
      deliveredCount: deliveredIds.length,
      keepsakeIds: deliveredIds,
    });
  }

  private async deliverKeepsakes(keepsakes: Keepsake[], triggerType: string): Promise<string[]> {
    const deliveredIds: string[] = [];

    for (const keepsake of keepsakes) {
      const deliverResult = keepsake.deliver();

      if (deliverResult.isErr()) {
        this.logger.error(`Failed to deliver keepsake ${keepsake.id}: ${deliverResult.error}`);
        continue;
      }

      await this.keepsakeRepository.save(keepsake);
      deliveredIds.push(keepsake.id);
      this.logger.log(`Delivered keepsake ${keepsake.id} (${triggerType})`);
    }

    return deliveredIds;
  }

  async executeManual(keepsakeId: string, userId: string): Promise<Result<void, string>> {
    this.logger.log(`Executing manual delivery for keepsake ${keepsakeId} by user ${userId}`);

    // Get keepsake
    const keepsake = await this.keepsakeRepository.findById(keepsakeId);
    if (!keepsake) {
      return err(`Keepsake with ID ${keepsakeId} not found`);
    }

    // Verify keepsake has manual trigger
    if (keepsake.triggerCondition !== TriggerCondition.MANUAL) {
      return err(
        `Keepsake ${keepsakeId} does not have manual trigger (has ${keepsake.triggerCondition})`,
      );
    }

    // Verify user owns the vault
    const vault = await this.vaultRepository.findById(keepsake.vaultId);
    if (!vault) {
      return err(`Vault ${keepsake.vaultId} not found`);
    }

    if (vault.userId !== userId) {
      return err(`User ${userId} does not own vault ${vault.id}`);
    }

    // Deliver the keepsake
    const deliverResult = keepsake.deliver();
    if (deliverResult.isErr()) {
      return err(deliverResult.error);
    }

    await this.keepsakeRepository.save(keepsake);

    this.logger.log(`Successfully delivered keepsake ${keepsakeId} manually`);

    return ok(undefined);
  }
}
