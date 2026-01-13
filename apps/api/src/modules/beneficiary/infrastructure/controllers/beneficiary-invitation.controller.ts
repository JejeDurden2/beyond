import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guards/jwt-auth.guard';
import { GetPendingInvitationsQuery } from '../../application/queries/get-pending-invitations.query';
import { ResendBeneficiaryInvitationCommand } from '../../application/commands/resend-beneficiary-invitation.command';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('beneficiary/invitations')
@UseGuards(JwtAuthGuard)
export class BeneficiaryInvitationController {
  constructor(
    private readonly getPendingInvitationsQuery: GetPendingInvitationsQuery,
    private readonly resendInvitationCommand: ResendBeneficiaryInvitationCommand,
  ) {}

  @Get('vault/:vaultId/pending')
  async getPendingInvitations(
    @Param('vaultId') vaultId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const result = await this.getPendingInvitationsQuery.execute(req.user.sub, vaultId);

    if (result.isErr()) {
      return { error: result.error };
    }

    return result.value;
  }

  @Post(':invitationId/resend')
  async resendInvitation(
    @Param('invitationId') invitationId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const result = await this.resendInvitationCommand.execute({
      invitationId,
      requestingUserId: req.user.sub,
    });

    if (result.isErr()) {
      return { error: result.error };
    }

    return { success: true };
  }
}
