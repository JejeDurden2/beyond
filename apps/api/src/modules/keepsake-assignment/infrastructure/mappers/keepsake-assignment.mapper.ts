import { KeepsakeAssignment as PrismaKeepsakeAssignment } from '@prisma/client';
import { KeepsakeAssignment } from '../../domain/entities/keepsake-assignment.entity';

export class KeepsakeAssignmentMapper {
  static toDomain(raw: PrismaKeepsakeAssignment): KeepsakeAssignment | null {
    const result = KeepsakeAssignment.create({
      id: raw.id,
      keepsakeId: raw.keepsakeId,
      beneficiaryId: raw.beneficiaryId,
      personalMessage: raw.personalMessage,
      createdAt: raw.createdAt,
    });

    if (result.isErr()) return null;

    return result.value;
  }

  static toPersistence(
    assignment: KeepsakeAssignment,
  ): Omit<PrismaKeepsakeAssignment, 'createdAt'> {
    return {
      id: assignment.id,
      keepsakeId: assignment.keepsakeId,
      beneficiaryId: assignment.beneficiaryId,
      personalMessage: assignment.personalMessage,
    };
  }
}
