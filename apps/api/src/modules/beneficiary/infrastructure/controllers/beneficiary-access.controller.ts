import {
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Public } from '@/modules/auth/infrastructure/decorators/public.decorator';
import { GetBeneficiaryAccessInfoQuery } from '../../application/queries/get-beneficiary-access-info.query';
import { CreateTemporaryAccessCommand } from '../../application/commands/create-temporary-access.command';

@Controller('beneficiary/access')
export class BeneficiaryAccessController {
  constructor(
    private readonly getAccessInfoQuery: GetBeneficiaryAccessInfoQuery,
    private readonly createTemporaryAccessCommand: CreateTemporaryAccessCommand,
  ) {}

  @Public()
  @Get(':token')
  async getAccessInfo(@Param('token') token: string) {
    const result = await this.getAccessInfoQuery.execute(token);

    if (result.isErr()) {
      const error = result.error;
      if (
        error.includes('not found') ||
        error.includes('expired') ||
        error.includes('already been accepted')
      ) {
        throw new NotFoundException(error);
      }
      throw new BadRequestException(error);
    }

    return result.value;
  }

  @Public()
  @Post(':token/view')
  @HttpCode(HttpStatus.OK)
  async createTemporaryAccess(@Param('token') token: string) {
    const result = await this.createTemporaryAccessCommand.execute({
      invitationToken: token,
    });

    if (result.isErr()) {
      const error = result.error;
      if (error.includes('not found') || error.includes('expired')) {
        throw new NotFoundException(error);
      }
      if (error.includes('trusted person')) {
        throw new ForbiddenException(error);
      }
      throw new BadRequestException(error);
    }

    return result.value;
  }
}
