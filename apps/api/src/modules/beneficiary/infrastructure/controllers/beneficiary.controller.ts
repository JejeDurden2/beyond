import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUser } from '@/modules/auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '@/modules/auth/infrastructure/strategies/jwt.strategy';
import { CreateBeneficiaryCommand } from '../../application/commands/create-beneficiary.command';
import { UpdateBeneficiaryCommand } from '../../application/commands/update-beneficiary.command';
import { DeleteBeneficiaryCommand } from '../../application/commands/delete-beneficiary.command';
import { ListBeneficiariesQuery } from '../../application/queries/list-beneficiaries.query';
import { GetBeneficiaryQuery } from '../../application/queries/get-beneficiary.query';
import { GetBeneficiaryKeepsakesQuery } from '@/modules/keepsake-assignment/application/queries/get-beneficiary-keepsakes.query';
import {
  CreateBeneficiaryDto,
  UpdateBeneficiaryDto,
  BeneficiaryResponseDto,
  BeneficiaryKeepsakeResponseDto,
} from '../dto/beneficiary.dto';
import type { Relationship } from '../../domain/entities/beneficiary.entity';

interface BeneficiaryData {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  relationship: Relationship;
  note: string | null;
  assignmentCount?: number;
  createdAt: Date;
}

function toBeneficiaryDto(beneficiary: BeneficiaryData): BeneficiaryResponseDto {
  return {
    id: beneficiary.id,
    firstName: beneficiary.firstName,
    lastName: beneficiary.lastName,
    fullName: beneficiary.fullName,
    email: beneficiary.email,
    relationship: beneficiary.relationship,
    note: beneficiary.note,
    assignmentCount: beneficiary.assignmentCount ?? 0,
    createdAt: beneficiary.createdAt.toISOString(),
  };
}

@Controller('vault/beneficiaries')
export class BeneficiaryController {
  constructor(
    private readonly createBeneficiaryCommand: CreateBeneficiaryCommand,
    private readonly updateBeneficiaryCommand: UpdateBeneficiaryCommand,
    private readonly deleteBeneficiaryCommand: DeleteBeneficiaryCommand,
    private readonly listBeneficiariesQuery: ListBeneficiariesQuery,
    private readonly getBeneficiaryQuery: GetBeneficiaryQuery,
    private readonly getBeneficiaryKeepsakesQuery: GetBeneficiaryKeepsakesQuery,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBeneficiaryDto,
  ): Promise<BeneficiaryResponseDto> {
    const result = await this.createBeneficiaryCommand.execute({
      userId: user.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      relationship: dto.relationship,
      note: dto.note,
    });

    if (result.isErr()) {
      throw new BadRequestException(result.error);
    }

    return toBeneficiaryDto(result.value);
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ beneficiaries: BeneficiaryResponseDto[] }> {
    const result = await this.listBeneficiariesQuery.execute({
      userId: user.id,
    });

    if (result.isErr()) {
      throw new BadRequestException(result.error);
    }

    return {
      beneficiaries: result.value.beneficiaries.map((b) => toBeneficiaryDto(b)),
    };
  }

  @Get(':id')
  async get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<BeneficiaryResponseDto> {
    const result = await this.getBeneficiaryQuery.execute({
      userId: user.id,
      beneficiaryId: id,
    });

    if (result.isErr()) {
      throw new NotFoundException(result.error);
    }

    return toBeneficiaryDto(result.value);
  }

  @Get(':id/keepsakes')
  async getKeepsakes(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ keepsakes: BeneficiaryKeepsakeResponseDto[] }> {
    const result = await this.getBeneficiaryKeepsakesQuery.execute({
      userId: user.id,
      beneficiaryId: id,
    });

    if (result.isErr()) {
      throw new NotFoundException(result.error);
    }

    return {
      keepsakes: result.value.keepsakes.map((k) => ({
        id: k.id,
        keepsakeId: k.keepsakeId,
        keepsakeTitle: k.keepsakeTitle,
        keepsakeType: k.keepsakeType,
        keepsakeStatus: k.keepsakeStatus,
        keepsakeUpdatedAt: k.keepsakeUpdatedAt.toISOString(),
        personalMessage: k.personalMessage,
        createdAt: k.createdAt.toISOString(),
      })),
    };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateBeneficiaryDto,
  ): Promise<BeneficiaryResponseDto> {
    const result = await this.updateBeneficiaryCommand.execute({
      userId: user.id,
      beneficiaryId: id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      relationship: dto.relationship,
      note: dto.note,
    });

    if (result.isErr()) {
      if (result.error === 'Beneficiary not found') {
        throw new NotFoundException(result.error);
      }
      throw new BadRequestException(result.error);
    }

    return toBeneficiaryDto(result.value);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<void> {
    const result = await this.deleteBeneficiaryCommand.execute({
      userId: user.id,
      beneficiaryId: id,
    });

    if (result.isErr()) {
      throw new NotFoundException(result.error);
    }
  }
}
