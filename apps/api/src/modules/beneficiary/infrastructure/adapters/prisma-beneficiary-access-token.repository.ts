import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { IBeneficiaryAccessTokenRepository } from '../../domain/repositories/beneficiary-access-token.repository';
import { BeneficiaryAccessToken } from '../../domain/entities/beneficiary-access-token.entity';

interface PrismaBeneficiaryAccessTokenRecord {
  id: string;
  beneficiaryId: string;
  token: string;
  expiresAt: Date;
  lastAccessedAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class PrismaBeneficiaryAccessTokenRepository implements IBeneficiaryAccessTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(accessToken: BeneficiaryAccessToken): Promise<void> {
    await this.prisma.beneficiaryAccessToken.upsert({
      where: { id: accessToken.id },
      create: {
        id: accessToken.id,
        beneficiaryId: accessToken.beneficiaryId,
        token: accessToken.token,
        expiresAt: accessToken.expiresAt,
        lastAccessedAt: accessToken.lastAccessedAt,
        createdAt: accessToken.createdAt,
      },
      update: {
        lastAccessedAt: accessToken.lastAccessedAt,
      },
    });
  }

  async findById(id: string): Promise<BeneficiaryAccessToken | null> {
    const record = await this.prisma.beneficiaryAccessToken.findUnique({
      where: { id },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByToken(token: string): Promise<BeneficiaryAccessToken | null> {
    const record = await this.prisma.beneficiaryAccessToken.findUnique({
      where: { token },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByBeneficiaryId(beneficiaryId: string): Promise<BeneficiaryAccessToken[]> {
    const records = await this.prisma.beneficiaryAccessToken.findMany({
      where: { beneficiaryId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record: PrismaBeneficiaryAccessTokenRecord) => this.toDomain(record));
  }

  async findValidByBeneficiaryId(beneficiaryId: string): Promise<BeneficiaryAccessToken | null> {
    const record = await this.prisma.beneficiaryAccessToken.findFirst({
      where: {
        beneficiaryId,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return record ? this.toDomain(record) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.beneficiaryAccessToken.delete({
      where: { id },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.beneficiaryAccessToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  private toDomain(record: PrismaBeneficiaryAccessTokenRecord): BeneficiaryAccessToken {
    return BeneficiaryAccessToken.reconstitute({
      id: record.id,
      beneficiaryId: record.beneficiaryId,
      token: record.token,
      expiresAt: record.expiresAt,
      lastAccessedAt: record.lastAccessedAt,
      createdAt: record.createdAt,
    });
  }
}
