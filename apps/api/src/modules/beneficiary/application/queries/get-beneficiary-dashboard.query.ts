import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  IBeneficiaryProfileRepository,
  BENEFICIARY_PROFILE_REPOSITORY,
} from '../../domain/repositories/beneficiary-profile.repository';
import { KeepsakeStatus } from '@/modules/keepsake/domain/entities/keepsake.entity';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';

export interface BeneficiaryKeepsakeDto {
  id: string;
  type: string;
  title: string;
  senderName: string;
  vaultId: string;
  deliveredAt: string;
  trigger: string;
  hasPersonalMessage: boolean;
  personalMessage?: string;
}

export interface LinkedVaultDto {
  vaultId: string;
  vaultOwnerName: string;
  isTrustedPersonFor: boolean;
  deathDeclared: boolean;
  deathDeclaredAt?: string;
}

export interface BeneficiaryDashboardOutput {
  keepsakes: BeneficiaryKeepsakeDto[];
  profile: {
    isTrustedPerson: boolean;
    linkedVaults: LinkedVaultDto[];
  };
}

@Injectable()
export class GetBeneficiaryDashboardQuery {
  constructor(
    @Inject(BENEFICIARY_PROFILE_REPOSITORY)
    private readonly profileRepository: IBeneficiaryProfileRepository,
    private readonly prisma: PrismaService,
  ) {}

  private formatUserName(
    user: { firstName: string | null; lastName: string | null; email: string } | null,
  ): string {
    if (!user) {
      return 'Unknown';
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  }

  async execute(userId: string): Promise<Result<BeneficiaryDashboardOutput, string>> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      return err('Beneficiary profile not found');
    }

    // Get all beneficiary records linked to this profile
    const beneficiaryRecords = await this.prisma.beneficiary.findMany({
      where: { beneficiaryProfileId: profile.id },
      include: {
        vault: {
          include: {
            user: true,
          },
        },
        assignments: {
          include: {
            keepsake: true,
          },
        },
      },
    });

    return this.buildDashboard(beneficiaryRecords);
  }

  async executeForBeneficiary(
    beneficiaryId: string,
  ): Promise<Result<BeneficiaryDashboardOutput, string>> {
    // For temporary access, get the specific beneficiary and all related beneficiaries with same email/vaultId
    const beneficiary = await this.prisma.beneficiary.findUnique({
      where: { id: beneficiaryId },
      include: {
        vault: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!beneficiary) {
      return err('Beneficiary not found');
    }

    // Get all beneficiary records for the same vault (same email might have multiple)
    const beneficiaryRecords = await this.prisma.beneficiary.findMany({
      where: {
        vaultId: beneficiary.vaultId,
        email: beneficiary.email,
      },
      include: {
        vault: {
          include: {
            user: true,
          },
        },
        assignments: {
          include: {
            keepsake: true,
          },
        },
      },
    });

    return this.buildDashboard(beneficiaryRecords);
  }

  private async buildDashboard(
    beneficiaryRecords: Array<{
      id: string;
      vaultId: string;
      isTrustedPerson: boolean;
      vault: {
        user: {
          firstName: string | null;
          lastName: string | null;
          email: string;
        } | null;
      } | null;
      assignments: Array<{
        personalMessage: string | null;
        keepsake: {
          id: string;
          type: string;
          title: string;
          status: string;
          vaultId: string;
          deliveredAt: Date | null;
          triggerCondition: string;
        };
      }>;
    }>,
  ): Promise<Result<BeneficiaryDashboardOutput, string>> {
    // Get all death declarations for linked vaults
    const vaultIds = beneficiaryRecords.map((b) => b.vaultId);
    const deathDeclarations = await this.prisma.deathDeclaration.findMany({
      where: { vaultId: { in: vaultIds } },
    });
    const deathDeclarationsByVault = new Map(deathDeclarations.map((d) => [d.vaultId, d]));

    const keepsakes: BeneficiaryKeepsakeDto[] = [];
    const linkedVaults: LinkedVaultDto[] = [];
    let isTrustedPerson = false;

    for (const beneficiary of beneficiaryRecords) {
      if (beneficiary.isTrustedPerson) {
        isTrustedPerson = true;
      }

      const vaultOwnerName = this.formatUserName(beneficiary.vault?.user ?? null);

      // Add linked vault info, avoiding duplicates
      if (!linkedVaults.find((v) => v.vaultId === beneficiary.vaultId)) {
        const declaration = deathDeclarationsByVault.get(beneficiary.vaultId);
        linkedVaults.push({
          vaultId: beneficiary.vaultId,
          vaultOwnerName,
          isTrustedPersonFor: beneficiary.isTrustedPerson,
          deathDeclared: !!declaration,
          deathDeclaredAt: declaration?.declaredAt.toISOString(),
        });
      }

      // Get delivered keepsakes assigned to this beneficiary
      for (const assignment of beneficiary.assignments) {
        const keepsake = assignment.keepsake;

        if (keepsake.status !== KeepsakeStatus.DELIVERED) {
          continue;
        }

        keepsakes.push({
          id: keepsake.id,
          type: keepsake.type,
          title: keepsake.title,
          senderName: vaultOwnerName,
          vaultId: keepsake.vaultId,
          deliveredAt: keepsake.deliveredAt?.toISOString() ?? new Date().toISOString(),
          trigger: keepsake.triggerCondition,
          hasPersonalMessage: !!assignment.personalMessage,
          personalMessage: assignment.personalMessage ?? undefined,
        });
      }
    }

    // Sort keepsakes by delivery date (most recent first)
    keepsakes.sort((a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime());

    return ok({
      keepsakes,
      profile: {
        isTrustedPerson,
        linkedVaults,
      },
    });
  }
}
