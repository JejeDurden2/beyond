import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BeneficiaryController } from './infrastructure/controllers/beneficiary.controller';
import { BeneficiaryAuthController } from './infrastructure/controllers/beneficiary-auth.controller';
import { BeneficiaryPortalController } from './infrastructure/controllers/beneficiary-portal.controller';
import { BeneficiaryInvitationController } from './infrastructure/controllers/beneficiary-invitation.controller';
import { BeneficiaryAccessController } from './infrastructure/controllers/beneficiary-access.controller';
import { PrismaBeneficiaryRepository } from './infrastructure/adapters/prisma-beneficiary.repository';
import { PrismaBeneficiaryProfileRepository } from './infrastructure/adapters/prisma-beneficiary-profile.repository';
import { PrismaBeneficiaryInvitationRepository } from './infrastructure/adapters/prisma-beneficiary-invitation.repository';
import { PrismaBeneficiaryAccessTokenRepository } from './infrastructure/adapters/prisma-beneficiary-access-token.repository';
import { BeneficiaryAccessGuard } from './infrastructure/guards/beneficiary-access.guard';
import { CreateBeneficiaryCommand } from './application/commands/create-beneficiary.command';
import { UpdateBeneficiaryCommand } from './application/commands/update-beneficiary.command';
import { DeleteBeneficiaryCommand } from './application/commands/delete-beneficiary.command';
import { SetTrustedPersonCommand } from './application/commands/set-trusted-person.command';
import { AcceptBeneficiaryInvitationCommand } from './application/commands/accept-beneficiary-invitation.command';
import { ResendBeneficiaryInvitationCommand } from './application/commands/resend-beneficiary-invitation.command';
import { CreateTemporaryAccessCommand } from './application/commands/create-temporary-access.command';
import { GetBeneficiaryAccessInfoQuery } from './application/queries/get-beneficiary-access-info.query';
import { ListBeneficiariesQuery } from './application/queries/list-beneficiaries.query';
import { GetBeneficiaryQuery } from './application/queries/get-beneficiary.query';
import { GetBeneficiaryDashboardQuery } from './application/queries/get-beneficiary-dashboard.query';
import { GetPendingInvitationsQuery } from './application/queries/get-pending-invitations.query';
import { BENEFICIARY_REPOSITORY } from './domain/repositories/beneficiary.repository';
import { BENEFICIARY_PROFILE_REPOSITORY } from './domain/repositories/beneficiary-profile.repository';
import { BENEFICIARY_INVITATION_REPOSITORY } from './domain/repositories/beneficiary-invitation.repository';
import { BENEFICIARY_ACCESS_TOKEN_REPOSITORY } from './domain/repositories/beneficiary-access-token.repository';
import { EMAIL_SERVICE } from '@/shared/ports/email.port';
import { ConsoleEmailAdapter } from '@/shared/adapters/console-email.adapter';
import { ResendEmailAdapter } from '@/shared/adapters/resend-email.adapter';
import { VaultModule } from '../vault/vault.module';
import { KeepsakeModule } from '../keepsake/keepsake.module';
import { KeepsakeAssignmentModule } from '../keepsake-assignment/keepsake-assignment.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    JwtModule.register({}),
    forwardRef(() => VaultModule),
    forwardRef(() => KeepsakeModule),
    forwardRef(() => KeepsakeAssignmentModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [
    BeneficiaryController,
    BeneficiaryAuthController,
    BeneficiaryPortalController,
    BeneficiaryInvitationController,
    BeneficiaryAccessController,
  ],
  providers: [
    {
      provide: BENEFICIARY_REPOSITORY,
      useClass: PrismaBeneficiaryRepository,
    },
    {
      provide: BENEFICIARY_PROFILE_REPOSITORY,
      useClass: PrismaBeneficiaryProfileRepository,
    },
    {
      provide: BENEFICIARY_INVITATION_REPOSITORY,
      useClass: PrismaBeneficiaryInvitationRepository,
    },
    {
      provide: BENEFICIARY_ACCESS_TOKEN_REPOSITORY,
      useClass: PrismaBeneficiaryAccessTokenRepository,
    },
    {
      provide: EMAIL_SERVICE,
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV');
        const resendApiKey = configService.get<string>('RESEND_API_KEY');

        if (nodeEnv === 'production' || resendApiKey) {
          return new ResendEmailAdapter(configService);
        }
        return new ConsoleEmailAdapter(configService);
      },
      inject: [ConfigService],
    },
    BeneficiaryAccessGuard,
    CreateBeneficiaryCommand,
    UpdateBeneficiaryCommand,
    DeleteBeneficiaryCommand,
    SetTrustedPersonCommand,
    AcceptBeneficiaryInvitationCommand,
    ResendBeneficiaryInvitationCommand,
    CreateTemporaryAccessCommand,
    ListBeneficiariesQuery,
    GetBeneficiaryQuery,
    GetBeneficiaryDashboardQuery,
    GetPendingInvitationsQuery,
    GetBeneficiaryAccessInfoQuery,
  ],
  exports: [
    BENEFICIARY_REPOSITORY,
    BENEFICIARY_PROFILE_REPOSITORY,
    BENEFICIARY_INVITATION_REPOSITORY,
    BENEFICIARY_ACCESS_TOKEN_REPOSITORY,
  ],
})
export class BeneficiaryModule {}
