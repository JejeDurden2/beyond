import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { IBeneficiaryProfileRepository } from '../../domain/repositories/beneficiary-profile.repository';
import { BeneficiaryProfile } from '../../domain/entities/beneficiary-profile.entity';

interface PrismaBeneficiaryProfileRecord {
  id: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PrismaBeneficiaryProfileRepository implements IBeneficiaryProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(profile: BeneficiaryProfile): Promise<void> {
    await this.prisma.beneficiaryProfile.upsert({
      where: { id: profile.id },
      create: {
        id: profile.id,
        userId: profile.userId,
        isActive: profile.isActive,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
      update: {
        isActive: profile.isActive,
        updatedAt: profile.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<BeneficiaryProfile | null> {
    const record = await this.prisma.beneficiaryProfile.findUnique({
      where: { id },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByUserId(userId: string): Promise<BeneficiaryProfile | null> {
    const record = await this.prisma.beneficiaryProfile.findUnique({
      where: { userId },
    });

    return record ? this.toDomain(record) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.beneficiaryProfile.delete({
      where: { id },
    });
  }

  private toDomain(record: PrismaBeneficiaryProfileRecord): BeneficiaryProfile {
    return BeneficiaryProfile.reconstitute({
      id: record.id,
      userId: record.userId,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
