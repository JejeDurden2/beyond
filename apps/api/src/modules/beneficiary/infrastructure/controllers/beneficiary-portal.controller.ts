import { Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guards/jwt-auth.guard';
import { GetBeneficiaryDashboardQuery } from '../../application/queries/get-beneficiary-dashboard.query';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('beneficiary/portal')
@UseGuards(JwtAuthGuard)
export class BeneficiaryPortalController {
  constructor(private readonly getDashboardQuery: GetBeneficiaryDashboardQuery) {}

  @Get('dashboard')
  async getDashboard(@Request() req: AuthenticatedRequest) {
    const result = await this.getDashboardQuery.execute(req.user.sub);

    if (result.isErr()) {
      return { error: result.error };
    }

    return result.value;
  }

  @Get('keepsakes/:id')
  async getKeepsake(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    // For now, the dashboard already returns all keepsake info
    // This endpoint can be used for individual keepsake fetching if needed
    const result = await this.getDashboardQuery.execute(req.user.sub);

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
  async recordKeepsakeView(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    // Record that the beneficiary viewed this keepsake
    // For now, just acknowledge the view - could be extended to track access logs
    const result = await this.getDashboardQuery.execute(req.user.sub);

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
}
