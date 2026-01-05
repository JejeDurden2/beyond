import { User as PrismaUser } from '@prisma/client';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';

export class UserMapper {
  static toDomain(raw: PrismaUser): User | null {
    const emailResult = Email.create(raw.email);
    if (emailResult.isErr()) return null;

    const password = Password.fromHash(raw.passwordHash);

    return User.reconstitute({
      id: raw.id,
      email: emailResult.value,
      password,
      emailVerified: raw.emailVerified,
      emailVerificationToken: raw.emailVerificationToken,
      totpSecret: raw.totpSecret,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toPersistence(user: User): Omit<PrismaUser, 'createdAt' | 'updatedAt'> {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.password.hashedValue,
      emailVerified: user.emailVerified,
      emailVerificationToken: user.emailVerificationToken,
      totpSecret: user.totpSecret,
      deletedAt: user.deletedAt,
    };
  }
}
