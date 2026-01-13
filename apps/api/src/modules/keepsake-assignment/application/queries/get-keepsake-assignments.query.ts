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
import { Relationship } from '@/modules/beneficiary/domain/entities/beneficiary.entity';

export interface GetKeepsakeAssignmentsInput {
  userId: string;
  keepsakeId: string;
}

export interface AssignmentItem {
  id: string;
  keepsakeId: string;
  beneficiaryId: string;
  beneficiaryFirstName: string;
  beneficiaryLastName: string;
  beneficiaryFullName: string;
  beneficiaryEmail: string;
  beneficiaryRelationship: Relationship;
  personalMessage: string | null;
  createdAt: Date;
}

export interface GetKeepsakeAssignmentsResult {
  assignments: AssignmentItem[];
}

@Injectable()
export class GetKeepsakeAssignmentsQuery {
  constructor(
    @Inject(KEEPSAKE_ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepository: KeepsakeAssignmentRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
    @Inject(KEEPSAKE_REPOSITORY)
    private readonly keepsakeRepository: KeepsakeRepository,
  ) {}

  async execute(
    input: GetKeepsakeAssignmentsInput,
  ): Promise<Result<GetKeepsakeAssignmentsResult, string>> {
    const vault = await this.vaultRepository.findByUserId(input.userId);
    if (!vault) {
      return err('Vault not found');
    }

    const keepsake = await this.keepsakeRepository.findById(input.keepsakeId);
    if (!keepsake || keepsake.vaultId !== vault.id) {
      return err('Keepsake not found');
    }

    const assignments = await this.assignmentRepository.findByKeepsakeIdWithDetails(
      input.keepsakeId,
    );

    return ok({
      assignments: assignments.map((a) => ({
        id: a.id,
        keepsakeId: a.keepsakeId,
        beneficiaryId: a.beneficiaryId,
        beneficiaryFirstName: a.beneficiaryFirstName,
        beneficiaryLastName: a.beneficiaryLastName,
        beneficiaryFullName: `${a.beneficiaryFirstName} ${a.beneficiaryLastName}`,
        beneficiaryEmail: a.beneficiaryEmail,
        beneficiaryRelationship: a.beneficiaryRelationship as Relationship,
        personalMessage: a.personalMessage,
        createdAt: a.createdAt,
      })),
    });
  }
}
