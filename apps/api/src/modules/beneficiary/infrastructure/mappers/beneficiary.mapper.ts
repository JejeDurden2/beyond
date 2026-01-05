import { Beneficiary as PrismaBeneficiary } from '@prisma/client';
import { Beneficiary } from '../../domain/entities/beneficiary.entity';

export class BeneficiaryMapper {
  static toDomain(raw: PrismaBeneficiary): Beneficiary | null {
    const result = Beneficiary.create({
      id: raw.id,
      vaultId: raw.vaultId,
      name: raw.name,
      email: raw.email,
      relationship: raw.relationship,
      accessToken: raw.accessToken,
      accessedAt: raw.accessedAt,
      createdAt: raw.createdAt,
    });

    if (result.isErr()) return null;

    return result.value;
  }

  static toPersistence(beneficiary: Beneficiary): Omit<PrismaBeneficiary, 'createdAt'> {
    return {
      id: beneficiary.id,
      vaultId: beneficiary.vaultId,
      name: beneficiary.name,
      email: beneficiary.email,
      relationship: beneficiary.relationship,
      accessToken: beneficiary.accessToken,
      accessedAt: beneficiary.accessedAt,
    };
  }
}
