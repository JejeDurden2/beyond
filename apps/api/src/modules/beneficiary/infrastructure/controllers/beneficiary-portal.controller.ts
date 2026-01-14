import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Result } from 'neverthrow';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guards/jwt-auth.guard';
import {
  BeneficiaryAccessGuard,
  BeneficiaryAccessRequest,
} from '../guards/beneficiary-access.guard';
import {
  GetBeneficiaryDashboardQuery,
  BeneficiaryDashboardOutput,
} from '../../application/queries/get-beneficiary-dashboard.query';
import { DeclareDeathCommand } from '@/modules/vault/application/commands/declare-death.command';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

interface DeclareDeathDto {
  vaultId: string;
}

@Controller('beneficiary/portal')
export class BeneficiaryPortalController {
  constructor(
    private readonly getDashboardQuery: GetBeneficiaryDashboardQuery,
    private readonly declareDeathCommand: DeclareDeathCommand,
  ) {}

  private fetchDashboard(
    req: BeneficiaryAccessRequest,
  ): Promise<Result<BeneficiaryDashboardOutput, string>> {
    if (req.user.isTemporaryAccess) {
      return this.getDashboardQuery.executeForBeneficiary(req.user.beneficiaryId);
    }
    return this.getDashboardQuery.execute(req.user.sub);
  }

  @Get('dashboard')
  @UseGuards(BeneficiaryAccessGuard)
  async getDashboard(@Request() req: BeneficiaryAccessRequest) {
    const result = await this.fetchDashboard(req);

    if (result.isErr()) {
      return { error: result.error };
    }

    const isFullAccess = !req.user.isTemporaryAccess;
    const isTrustedPerson = result.value.profile.isTrustedPerson;

    return {
      ...result.value,
      accessInfo: {
        isTemporaryAccess: req.user.isTemporaryAccess,
        canDeclareDeath: isFullAccess && isTrustedPerson,
        canManageInvitations: isFullAccess && isTrustedPerson,
      },
    };
  }

  @Get('keepsakes/:id')
  @UseGuards(BeneficiaryAccessGuard)
  async getKeepsake(@Param('id') id: string, @Request() req: BeneficiaryAccessRequest) {
    const result = await this.fetchDashboard(req);

    if (result.isErr()) {
      return { error: result.error };
    }

    const keepsake = result.value.keepsakes.find((k) => k.id === id);

    if (!keepsake) {
      return { error: 'Keepsake not found or access denied' };
    }

    return keepsake;
  }

  @Post('keepsakes/:id/view')
  @UseGuards(BeneficiaryAccessGuard)
  async recordKeepsakeView(@Param('id') id: string, @Request() req: BeneficiaryAccessRequest) {
    const result = await this.fetchDashboard(req);

    if (result.isErr()) {
      return { error: result.error };
    }

    const keepsake = result.value.keepsakes.find((k) => k.id === id);

    if (!keepsake) {
      return { error: 'Keepsake not found or access denied' };
    }

    // TODO: Could create a BeneficiaryPortalAccess record here for audit trail
    return { success: true };
  }

  @Post('declare-death')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async declareDeath(@Body() dto: DeclareDeathDto, @Request() req: AuthenticatedRequest) {
    // Only authenticated users can declare death (not temporary access)
    const result = await this.declareDeathCommand.execute({
      userId: req.user.sub,
      vaultId: dto.vaultId,
    });

    if (result.isErr()) {
      return { error: result.error };
    }

    return {
      success: true,
      declarationId: result.value.declarationId,
      declaredAt: result.value.declaredAt.toISOString(),
    };
  }
}
