import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { VaultRepository } from '../../domain/repositories/vault.repository';
import { Vault } from '../../domain/entities/vault.entity';
import { VaultMapper } from '../mappers/vault.mapper';

@Injectable()
export class PrismaVaultRepository implements VaultRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Vault | null> {
    const record = await this.prisma.vault.findUnique({
      where: { id },
    });

    if (!record) return null;

    return VaultMapper.toDomain(record);
  }

  async findByUserId(userId: string): Promise<Vault | null> {
    const record = await this.prisma.vault.findUnique({
      where: { userId },
    });

    if (!record) return null;

    return VaultMapper.toDomain(record);
  }

  async save(vault: Vault): Promise<void> {
    const data = VaultMapper.toPersistence(vault);

    await this.prisma.vault.upsert({
      where: { id: vault.id },
      create: data,
      update: data,
    });
  }
}
