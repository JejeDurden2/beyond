import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { KeepsakeRepository } from '../../domain/repositories/keepsake.repository';
import { Keepsake } from '../../domain/entities/keepsake.entity';
import { KeepsakeMapper } from '../mappers/keepsake.mapper';

@Injectable()
export class PrismaKeepsakeRepository implements KeepsakeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Keepsake | null> {
    const record = await this.prisma.keepsake.findUnique({
      where: { id },
    });

    if (!record) return null;

    return KeepsakeMapper.toDomain(record);
  }

  async findByVaultId(vaultId: string): Promise<Keepsake[]> {
    const records = await this.prisma.keepsake.findMany({
      where: { vaultId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(KeepsakeMapper.toDomain);
  }

  async save(keepsake: Keepsake): Promise<void> {
    const data = KeepsakeMapper.toPersistence(keepsake);

    await this.prisma.keepsake.upsert({
      where: { id: keepsake.id },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.keepsake.delete({
      where: { id },
    });
  }
}
