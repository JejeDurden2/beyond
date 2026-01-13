import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  KeepsakeAssignmentRepository,
  KEEPSAKE_ASSIGNMENT_REPOSITORY,
} from '../../domain/repositories/keepsake-assignment.repository';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';
import {
  KEEPSAKE_REPOSITORY,
  KeepsakeRepository,
} from '@/modules/keepsake/domain/repositories/keepsake.repository';

export interface UpdatePersonalMessageInput {
  userId: string;
  keepsakeId: string;
  beneficiaryId: string;
  personalMessage: string | null;
}

@Injectable()
export class UpdatePersonalMessageCommand {
  constructor(
    @Inject(KEEPSAKE_ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepository: KeepsakeAssignmentRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
    @Inject(KEEPSAKE_REPOSITORY)
    private readonly keepsakeRepository: KeepsakeRepository,
  ) {}

  async execute(input: UpdatePersonalMessageInput): Promise<Result<void, string>> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      return err('Vault not found');
    }

    const keepsake = await this.keepsakeRepository.findById(input.keepsakeId);
    if (!keepsake || keepsake.vaultId !== vault.id) {
      return err('Keepsake not found');
    }

    const assignment = await this.assignmentRepository.findOne(
      input.keepsakeId,
      input.beneficiaryId,
    );
    if (!assignment) {
      return err('Assignment not found');
    }

    assignment.updatePersonalMessage(input.personalMessage);
    await this.assignmentRepository.save(assignment);

    return ok(undefined);
  }
}
