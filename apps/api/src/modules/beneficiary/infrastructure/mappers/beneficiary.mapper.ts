import {
  Beneficiary as PrismaBeneficiary,
  Relationship as PrismaRelationship,
} from '@prisma/client';
import { Beneficiary, Relationship } from '../../domain/entities/beneficiary.entity';

export class BeneficiaryMapper {
  static toDomain(raw: PrismaBeneficiary): Beneficiary | null {
    const result = Beneficiary.create({
      id: raw.id,
      vaultId: raw.vaultId,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      relationship: raw.relationship as Relationship,
      note: raw.note,
      accessToken: raw.accessToken,
      accessedAt: raw.accessedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });

    if (result.isErr()) return null;

    return result.value;
  }

  static toPersistence(
    beneficiary: Beneficiary,
  ): Omit<PrismaBeneficiary, 'createdAt' | 'updatedAt'> {
    return {
      id: beneficiary.id,
      vaultId: beneficiary.vaultId,
      firstName: beneficiary.firstName,
      lastName: beneficiary.lastName,
      email: beneficiary.email,
      relationship: beneficiary.relationship as PrismaRelationship,
      note: beneficiary.note,
      accessToken: beneficiary.accessToken,
      accessedAt: beneficiary.accessedAt,
    };
  }
}
