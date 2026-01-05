import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!record) return null;

    return UserMapper.toDomain(record);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.value, deletedAt: null },
    });

    if (!record) return null;

    return UserMapper.toDomain(record);
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token, deletedAt: null },
    });

    if (!record) return null;

    return UserMapper.toDomain(record);
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);

    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        ...data,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      update: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
