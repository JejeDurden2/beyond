import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  IBeneficiaryAccessTokenRepository,
  BENEFICIARY_ACCESS_TOKEN_REPOSITORY,
} from '../../domain/repositories/beneficiary-access-token.repository';
import {
  BeneficiaryRepository,
  BENEFICIARY_REPOSITORY,
} from '../../domain/repositories/beneficiary.repository';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface BeneficiaryAccessRequest {
  user: {
    sub: string;
    email: string;
    role: string;
    isTemporaryAccess: boolean;
    beneficiaryId: string;
  };
}

@Injectable()
export class BeneficiaryAccessGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(BENEFICIARY_ACCESS_TOKEN_REPOSITORY)
    private readonly accessTokenRepository: IBeneficiaryAccessTokenRepository,
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly beneficiaryRepository: BeneficiaryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authentication required');
    }

    const [type, token] = authHeader.split(' ');

    if (type === 'Bearer') {
      // Try JWT first
      try {
        const payload = this.jwtService.verify<JwtPayload>(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });

        // For JWT auth, we don't need beneficiaryId - the dashboard query will find it
        request.user = {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
          isTemporaryAccess: false,
          beneficiaryId: '', // Will be determined by the query using userId
        };

        return true;
      } catch {
        // JWT failed, try temporary access token
        const accessToken = await this.accessTokenRepository.findByToken(token);

        if (!accessToken || !accessToken.isValid()) {
          throw new UnauthorizedException('Invalid or expired token');
        }

        // Record access
        accessToken.recordAccess();
        await this.accessTokenRepository.save(accessToken);

        // Get beneficiary info
        const beneficiary = await this.beneficiaryRepository.findById(accessToken.beneficiaryId);

        if (!beneficiary) {
          throw new UnauthorizedException('Beneficiary not found');
        }

        request.user = {
          sub: '', // No user account
          email: beneficiary.email,
          role: 'BENEFICIARY',
          isTemporaryAccess: true,
          beneficiaryId: beneficiary.id,
        };

        return true;
      }
    }

    throw new UnauthorizedException('Invalid authentication format');
  }
}
