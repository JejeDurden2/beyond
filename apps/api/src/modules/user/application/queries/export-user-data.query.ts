import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../../auth/domain/repositories/user.repository';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';

export interface ExportUserDataInput {
  userId: string;
}

export interface ExportedUserData {
  exportedAt: string;
  format: 'json';
  gdprArticle: 'Article 20 - Right to Data Portability';
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    emailVerified: boolean;
    role: string;
    termsAcceptedAt: string | null;
    privacyPolicyAcceptedAt: string | null;
    termsVersion: string | null;
    onboardingCompletedAt: string | null;
    createdAt: string;
  };
  vault: {
    id: string;
    status: string;
    createdAt: string;
  } | null;
  keepsakes: Array<{
    id: string;
    type: string;
    title: string;
    status: string;
    triggerCondition: string;
    createdAt: string;
    updatedAt: string;
  }>;
  beneficiaries: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    relationship: string;
    note: string | null;
    isTrustedPerson: boolean;
    createdAt: string;
  }>;
  trustedContacts: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }>;
  secureFiles: Array<{
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    createdAt: string;
  }>;
  // Beneficiary profile (if user is also a beneficiary)
  beneficiaryProfile: {
    id: string;
    isActive: boolean;
    receivedKeepsakes: Array<{
      keepsakeId: string;
      vaultOwnerEmail: string;
      assignedAt: string;
    }>;
  } | null;
}

@Injectable()
export class ExportUserDataQuery {
  private readonly logger = new Logger(ExportUserDataQuery.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: ExportUserDataInput): Promise<ExportedUserData> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Fetch all related data
    const [vault, keepsakes, beneficiaries, trustedContacts, secureFiles, beneficiaryProfile] =
      await Promise.all([
        this.prisma.vault.findUnique({
          where: { userId: input.userId },
          select: { id: true, status: true, createdAt: true },
        }),
        this.getKeepsakes(input.userId),
        this.getBeneficiaries(input.userId),
        this.getTrustedContacts(input.userId),
        this.getSecureFiles(input.userId),
        this.getBeneficiaryProfile(input.userId),
      ]);

    this.logger.log(`User data exported for user ${input.userId}`);

    return {
      exportedAt: new Date().toISOString(),
      format: 'json',
      gdprArticle: 'Article 20 - Right to Data Portability',
      user: {
        id: user.id,
        email: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        role: user.role,
        termsAcceptedAt: user.termsAcceptedAt?.toISOString() ?? null,
        privacyPolicyAcceptedAt: user.privacyPolicyAcceptedAt?.toISOString() ?? null,
        termsVersion: user.termsVersion,
        onboardingCompletedAt: user.onboardingCompletedAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
      },
      vault: vault
        ? {
            id: vault.id,
            status: vault.status,
            createdAt: vault.createdAt.toISOString(),
          }
        : null,
      keepsakes,
      beneficiaries,
      trustedContacts,
      secureFiles,
      beneficiaryProfile,
    };
  }

  private async getKeepsakes(userId: string) {
    const vault = await this.prisma.vault.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!vault) return [];

    const keepsakes = await this.prisma.keepsake.findMany({
      where: { vaultId: vault.id, deletedAt: null },
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        triggerCondition: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return keepsakes.map((k) => ({
      id: k.id,
      type: k.type,
      title: k.title,
      status: k.status,
      triggerCondition: k.triggerCondition,
      createdAt: k.createdAt.toISOString(),
      updatedAt: k.updatedAt.toISOString(),
    }));
  }

  private async getBeneficiaries(userId: string) {
    const vault = await this.prisma.vault.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!vault) return [];

    const beneficiaries = await this.prisma.beneficiary.findMany({
      where: { vaultId: vault.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        relationship: true,
        note: true,
        isTrustedPerson: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return beneficiaries.map((b) => ({
      id: b.id,
      firstName: b.firstName,
      lastName: b.lastName,
      email: b.email,
      relationship: b.relationship,
      note: b.note,
      isTrustedPerson: b.isTrustedPerson,
      createdAt: b.createdAt.toISOString(),
    }));
  }

  private async getTrustedContacts(userId: string) {
    const contacts = await this.prisma.trustedContact.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return contacts.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  private async getSecureFiles(userId: string) {
    const files = await this.prisma.secureFile.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return files.map((f) => ({
      id: f.id,
      filename: f.filename,
      mimeType: f.mimeType,
      size: f.size,
      createdAt: f.createdAt.toISOString(),
    }));
  }

  private async getBeneficiaryProfile(userId: string) {
    const profile = await this.prisma.beneficiaryProfile.findUnique({
      where: { userId },
      include: {
        beneficiaries: {
          include: {
            vault: {
              include: {
                user: {
                  select: { email: true },
                },
              },
            },
            assignments: {
              select: {
                keepsakeId: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!profile) return null;

    const receivedKeepsakes = profile.beneficiaries.flatMap((b) =>
      b.assignments.map((a) => ({
        keepsakeId: a.keepsakeId,
        vaultOwnerEmail: b.vault.user.email,
        assignedAt: a.createdAt.toISOString(),
      })),
    );

    return {
      id: profile.id,
      isActive: profile.isActive,
      receivedKeepsakes,
    };
  }
}
