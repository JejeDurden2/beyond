import { User as PrismaUser } from '@prisma/client';
import { User, UserRole } from '../../domain/entities/user.entity';
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
      firstName: raw.firstName,
      lastName: raw.lastName,
      avatarUrl: raw.avatarUrl,
      onboardingCompletedAt: raw.onboardingCompletedAt,
      emailVerified: raw.emailVerified,
      emailVerificationToken: raw.emailVerificationToken,
      emailVerificationTokenExpiry: raw.emailVerificationTokenExpiry,
      totpSecret: raw.totpSecret,
      role: raw.role as UserRole,
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
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      onboardingCompletedAt: user.onboardingCompletedAt,
      emailVerified: user.emailVerified,
      emailVerificationToken: user.emailVerificationToken,
      emailVerificationTokenExpiry: user.emailVerificationTokenExpiry,
      totpSecret: user.totpSecret,
      role: user.role,
      deletedAt: user.deletedAt,
    };
  }
}
