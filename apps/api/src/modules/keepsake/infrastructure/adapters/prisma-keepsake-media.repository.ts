import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { KeepsakeMediaRepository } from '../../domain/repositories/keepsake.repository';
import { KeepsakeMedia } from '../../domain/entities/keepsake-media.entity';
import { KeepsakeMediaMapper } from '../mappers/keepsake.mapper';

@Injectable()
export class PrismaKeepsakeMediaRepository implements KeepsakeMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<KeepsakeMedia | null> {
    const record = await this.prisma.keepsakeMedia.findUnique({
      where: { id },
    });

    if (!record) return null;

    return KeepsakeMediaMapper.toDomain(record);
  }

  async findByKeepsakeId(keepsakeId: string): Promise<KeepsakeMedia[]> {
    const records = await this.prisma.keepsakeMedia.findMany({
      where: { keepsakeId },
      orderBy: { order: 'asc' },
    });

    return records.map(KeepsakeMediaMapper.toDomain);
  }

  async findByKey(key: string): Promise<KeepsakeMedia | null> {
    const record = await this.prisma.keepsakeMedia.findUnique({
      where: { key },
    });

    if (!record) return null;

    return KeepsakeMediaMapper.toDomain(record);
  }

  async save(media: KeepsakeMedia): Promise<void> {
    const data = KeepsakeMediaMapper.toPersistence(media);

    await this.prisma.keepsakeMedia.upsert({
      where: { id: media.id },
      create: data,
      update: data,
    });
  }

  async saveMany(media: KeepsakeMedia[]): Promise<void> {
    const operations = media.map((m) => {
      const data = KeepsakeMediaMapper.toPersistence(m);
      return this.prisma.keepsakeMedia.upsert({
        where: { id: m.id },
        create: data,
        update: data,
      });
    });

    await this.prisma.$transaction(operations);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.keepsakeMedia.delete({
      where: { id },
    });
  }

  async deleteByKeepsakeId(keepsakeId: string): Promise<void> {
    await this.prisma.keepsakeMedia.deleteMany({
      where: { keepsakeId },
    });
  }
}
