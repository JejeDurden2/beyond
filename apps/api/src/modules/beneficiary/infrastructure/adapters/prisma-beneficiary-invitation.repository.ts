import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { IBeneficiaryInvitationRepository } from '../../domain/repositories/beneficiary-invitation.repository';
import {
  BeneficiaryInvitation,
  InvitationStatus,
} from '../../domain/entities/beneficiary-invitation.entity';

interface PrismaBeneficiaryInvitationRecord {
  id: string;
  beneficiaryId: string;
  keepsakeId: string | null;
  token: string;
  status: string;
  sentAt: Date;
  viewedAt: Date | null;
  acceptedAt: Date | null;
  expiresAt: Date;
  resentBy: string | null;
  resentAt: Date | null;
  resentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PrismaBeneficiaryInvitationRepository implements IBeneficiaryInvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(invitation: BeneficiaryInvitation): Promise<void> {
    await this.prisma.beneficiaryInvitation.upsert({
      where: { id: invitation.id },
      create: {
        id: invitation.id,
        beneficiaryId: invitation.beneficiaryId,
        keepsakeId: invitation.keepsakeId,
        token: invitation.token,
        status: invitation.status,
        sentAt: invitation.sentAt,
        viewedAt: invitation.viewedAt,
        acceptedAt: invitation.acceptedAt,
        expiresAt: invitation.expiresAt,
        resentBy: invitation.resentBy,
        resentAt: invitation.resentAt,
        resentCount: invitation.resentCount,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
      },
      update: {
        status: invitation.status,
        viewedAt: invitation.viewedAt,
        acceptedAt: invitation.acceptedAt,
        expiresAt: invitation.expiresAt,
        resentBy: invitation.resentBy,
        resentAt: invitation.resentAt,
        resentCount: invitation.resentCount,
        updatedAt: invitation.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<BeneficiaryInvitation | null> {
    const record = await this.prisma.beneficiaryInvitation.findUnique({
      where: { id },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByToken(token: string): Promise<BeneficiaryInvitation | null> {
    const record = await this.prisma.beneficiaryInvitation.findUnique({
      where: { token },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByBeneficiaryId(beneficiaryId: string): Promise<BeneficiaryInvitation[]> {
    const records = await this.prisma.beneficiaryInvitation.findMany({
      where: { beneficiaryId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record: PrismaBeneficiaryInvitationRecord) => this.toDomain(record));
  }

  async findByKeepsakeId(keepsakeId: string): Promise<BeneficiaryInvitation[]> {
    const records = await this.prisma.beneficiaryInvitation.findMany({
      where: { keepsakeId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record: PrismaBeneficiaryInvitationRecord) => this.toDomain(record));
  }

  async findPendingByVaultId(vaultId: string): Promise<BeneficiaryInvitation[]> {
    const records = await this.prisma.beneficiaryInvitation.findMany({
      where: {
        beneficiary: {
          vaultId,
        },
        status: {
          in: ['PENDING', 'VIEWED'],
        },
      },
      include: {
        beneficiary: true,
        keepsake: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record: PrismaBeneficiaryInvitationRecord) => this.toDomain(record));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.beneficiaryInvitation.delete({
      where: { id },
    });
  }

  private toDomain(record: PrismaBeneficiaryInvitationRecord): BeneficiaryInvitation {
    return BeneficiaryInvitation.reconstitute({
      id: record.id,
      beneficiaryId: record.beneficiaryId,
      keepsakeId: record.keepsakeId,
      token: record.token,
      status: record.status as InvitationStatus,
      sentAt: record.sentAt,
      viewedAt: record.viewedAt,
      acceptedAt: record.acceptedAt,
      expiresAt: record.expiresAt,
      resentBy: record.resentBy,
      resentAt: record.resentAt,
      resentCount: record.resentCount,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
