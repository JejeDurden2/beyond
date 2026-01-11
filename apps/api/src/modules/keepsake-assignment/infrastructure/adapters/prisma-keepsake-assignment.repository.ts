import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import {
  KeepsakeAssignmentRepository,
  KeepsakeAssignmentWithDetails,
  KeepsakeAssignmentWithKeepsake,
} from '../../domain/repositories/keepsake-assignment.repository';
import { KeepsakeAssignment } from '../../domain/entities/keepsake-assignment.entity';
import { KeepsakeAssignmentMapper } from '../mappers/keepsake-assignment.mapper';

@Injectable()
export class PrismaKeepsakeAssignmentRepository implements KeepsakeAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByKeepsakeId(keepsakeId: string): Promise<KeepsakeAssignment[]> {
    const records = await this.prisma.keepsakeAssignment.findMany({
      where: { keepsakeId },
      orderBy: { createdAt: 'asc' },
    });

    return records
      .map((record) => KeepsakeAssignmentMapper.toDomain(record))
      .filter((a): a is KeepsakeAssignment => a !== null);
  }

  async findByBeneficiaryId(beneficiaryId: string): Promise<KeepsakeAssignment[]> {
    const records = await this.prisma.keepsakeAssignment.findMany({
      where: { beneficiaryId },
      orderBy: { createdAt: 'asc' },
    });

    return records
      .map((record) => KeepsakeAssignmentMapper.toDomain(record))
      .filter((a): a is KeepsakeAssignment => a !== null);
  }

  async findByKeepsakeIdWithDetails(keepsakeId: string): Promise<KeepsakeAssignmentWithDetails[]> {
    const records = await this.prisma.keepsakeAssignment.findMany({
      where: { keepsakeId },
      include: {
        beneficiary: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return records
      .map((record) => {
        const assignment = KeepsakeAssignmentMapper.toDomain(record);
        if (!assignment) return null;

        return Object.assign(assignment, {
          beneficiaryFirstName: record.beneficiary.firstName,
          beneficiaryLastName: record.beneficiary.lastName,
          beneficiaryEmail: record.beneficiary.email,
          beneficiaryRelationship: record.beneficiary.relationship,
        }) as KeepsakeAssignmentWithDetails;
      })
      .filter((a): a is KeepsakeAssignmentWithDetails => a !== null);
  }

  async findByBeneficiaryIdWithKeepsakes(
    beneficiaryId: string,
  ): Promise<KeepsakeAssignmentWithKeepsake[]> {
    const records = await this.prisma.keepsakeAssignment.findMany({
      where: {
        beneficiaryId,
        keepsake: { deletedAt: null },
      },
      include: {
        keepsake: true,
      },
      orderBy: { keepsake: { updatedAt: 'desc' } },
    });

    return records
      .map((record) => {
        const assignment = KeepsakeAssignmentMapper.toDomain(record);
        if (!assignment) return null;

        return Object.assign(assignment, {
          keepsakeTitle: record.keepsake.title,
          keepsakeType: record.keepsake.type,
          keepsakeStatus: record.keepsake.status,
          keepsakeUpdatedAt: record.keepsake.updatedAt,
        }) as KeepsakeAssignmentWithKeepsake;
      })
      .filter((a): a is KeepsakeAssignmentWithKeepsake => a !== null);
  }

  async findOne(keepsakeId: string, beneficiaryId: string): Promise<KeepsakeAssignment | null> {
    const record = await this.prisma.keepsakeAssignment.findUnique({
      where: {
        keepsakeId_beneficiaryId: { keepsakeId, beneficiaryId },
      },
    });

    if (!record) return null;

    return KeepsakeAssignmentMapper.toDomain(record);
  }

  async save(assignment: KeepsakeAssignment): Promise<void> {
    const data = KeepsakeAssignmentMapper.toPersistence(assignment);

    await this.prisma.keepsakeAssignment.upsert({
      where: {
        keepsakeId_beneficiaryId: {
          keepsakeId: assignment.keepsakeId,
          beneficiaryId: assignment.beneficiaryId,
        },
      },
      create: data,
      update: { personalMessage: data.personalMessage },
    });
  }

  async delete(keepsakeId: string, beneficiaryId: string): Promise<void> {
    await this.prisma.keepsakeAssignment.delete({
      where: {
        keepsakeId_beneficiaryId: { keepsakeId, beneficiaryId },
      },
    });
  }

  async deleteByKeepsakeId(keepsakeId: string): Promise<void> {
    await this.prisma.keepsakeAssignment.deleteMany({
      where: { keepsakeId },
    });
  }

  async bulkAssign(
    keepsakeId: string,
    beneficiaryIds: string[],
    existingAssignments: KeepsakeAssignment[],
  ): Promise<void> {
    const existingBeneficiaryIds = new Set(existingAssignments.map((a) => a.beneficiaryId));
    const newBeneficiaryIds = new Set(beneficiaryIds);

    const toDelete = existingAssignments.filter((a) => !newBeneficiaryIds.has(a.beneficiaryId));
    const toCreate = beneficiaryIds.filter((id) => !existingBeneficiaryIds.has(id));

    await this.prisma.$transaction([
      ...toDelete.map((a) =>
        this.prisma.keepsakeAssignment.delete({
          where: {
            keepsakeId_beneficiaryId: { keepsakeId, beneficiaryId: a.beneficiaryId },
          },
        }),
      ),
      ...toCreate.map((beneficiaryId) =>
        this.prisma.keepsakeAssignment.create({
          data: { keepsakeId, beneficiaryId },
        }),
      ),
    ]);
  }
}
