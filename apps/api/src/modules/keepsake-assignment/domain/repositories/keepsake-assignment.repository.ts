import { KeepsakeAssignment } from '../entities/keepsake-assignment.entity';

export interface KeepsakeAssignmentWithDetails extends KeepsakeAssignment {
  beneficiaryFirstName: string;
  beneficiaryLastName: string;
  beneficiaryEmail: string;
  beneficiaryRelationship: string;
}

export interface KeepsakeAssignmentRepository {
  findByKeepsakeId(keepsakeId: string): Promise<KeepsakeAssignment[]>;
  findByBeneficiaryId(beneficiaryId: string): Promise<KeepsakeAssignment[]>;
  findByKeepsakeIdWithDetails(keepsakeId: string): Promise<KeepsakeAssignmentWithDetails[]>;
  findOne(keepsakeId: string, beneficiaryId: string): Promise<KeepsakeAssignment | null>;
  save(assignment: KeepsakeAssignment): Promise<void>;
  delete(keepsakeId: string, beneficiaryId: string): Promise<void>;
  deleteByKeepsakeId(keepsakeId: string): Promise<void>;
  bulkAssign(
    keepsakeId: string,
    beneficiaryIds: string[],
    existingAssignments: KeepsakeAssignment[],
  ): Promise<void>;
}

export const KEEPSAKE_ASSIGNMENT_REPOSITORY = 'KeepsakeAssignmentRepository';
