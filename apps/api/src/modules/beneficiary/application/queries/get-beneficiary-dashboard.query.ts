import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import {
  IBeneficiaryProfileRepository,
  BENEFICIARY_PROFILE_REPOSITORY,
} from '../../domain/repositories/beneficiary-profile.repository';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '../../domain/repositories/beneficiary.repository';
import {
  KeepsakeRepository,
  KEEPSAKE_REPOSITORY,
} from '@/modules/keepsake/domain/repositories/keepsake.repository';
import {
  VaultRepository,
  VAULT_REPOSITORY,
} from '@/modules/vault/domain/repositories/vault.repository';
import {
  UserRepository,
  USER_REPOSITORY,
} from '@/modules/auth/domain/repositories/user.repository';
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
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
    @Inject(KEEPSAKE_REPOSITORY)
    private readonly keepsakeRepository: KeepsakeRepository,
    @Inject(VAULT_REPOSITORY)
    private readonly vaultRepository: VaultRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

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

    const keepsakes: BeneficiaryKeepsakeDto[] = [];
    const linkedVaults: LinkedVaultDto[] = [];
    let isTrustedPerson = false;

    for (const beneficiary of beneficiaryRecords) {
      // Check if this beneficiary is a trusted person
      if (beneficiary.isTrustedPerson) {
        isTrustedPerson = true;
      }

      // Add linked vault info
      if (beneficiary.vault?.user) {
        const vaultOwnerName =
          beneficiary.vault.user.firstName && beneficiary.vault.user.lastName
            ? `${beneficiary.vault.user.firstName} ${beneficiary.vault.user.lastName}`
            : beneficiary.vault.user.email;

        // Avoid duplicates
        if (!linkedVaults.find((v) => v.vaultId === beneficiary.vaultId)) {
          linkedVaults.push({
            vaultId: beneficiary.vaultId,
            vaultOwnerName,
          });
        }
      }

      // Get keepsakes assigned to this beneficiary that have been delivered
      for (const assignment of beneficiary.assignments) {
        const keepsake = assignment.keepsake;

        // Only include delivered keepsakes
        if (keepsake.status !== KeepsakeStatus.DELIVERED) {
          continue;
        }

        const senderName =
          beneficiary.vault?.user?.firstName && beneficiary.vault?.user?.lastName
            ? `${beneficiary.vault.user.firstName} ${beneficiary.vault.user.lastName}`
            : (beneficiary.vault?.user?.email ?? 'Unknown');

        keepsakes.push({
          id: keepsake.id,
          type: keepsake.type,
          title: keepsake.title,
          senderName,
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
