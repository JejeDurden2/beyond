import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { BeneficiaryRepository } from '../../domain/repositories/beneficiary.repository';
import { Beneficiary } from '../../domain/entities/beneficiary.entity';
import { BeneficiaryMapper } from '../mappers/beneficiary.mapper';

@Injectable()
export class PrismaBeneficiaryRepository implements BeneficiaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Beneficiary | null> {
    const record = await this.prisma.beneficiary.findUnique({
      where: { id },
    });

    if (!record) return null;

    return BeneficiaryMapper.toDomain(record);
  }

  async findByVaultId(vaultId: string): Promise<Beneficiary[]> {
    const records = await this.prisma.beneficiary.findMany({
      where: { vaultId },
      orderBy: { createdAt: 'desc' },
    });

    return records
      .map((record) => BeneficiaryMapper.toDomain(record))
      .filter((b): b is Beneficiary => b !== null);
  }

  async findByEmail(vaultId: string, email: string): Promise<Beneficiary | null> {
    const record = await this.prisma.beneficiary.findUnique({
      where: {
        vaultId_email: { vaultId, email },
      },
    });

    if (!record) return null;

    return BeneficiaryMapper.toDomain(record);
  }

  async findByAccessToken(token: string): Promise<Beneficiary | null> {
    const record = await this.prisma.beneficiary.findUnique({
      where: { accessToken: token },
    });

    if (!record) return null;

    return BeneficiaryMapper.toDomain(record);
  }

  async save(beneficiary: Beneficiary): Promise<void> {
    const data = BeneficiaryMapper.toPersistence(beneficiary);

    await this.prisma.beneficiary.upsert({
      where: { id: beneficiary.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.beneficiary.delete({
      where: { id },
    });
  }

  async countAssignments(beneficiaryId: string): Promise<number> {
    return this.prisma.keepsakeAssignment.count({
      where: { beneficiaryId },
    });
  }
}
