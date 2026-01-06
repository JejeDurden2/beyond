import {
  Controller,
  Get,
  Put,
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
import { BulkAssignCommand } from '../../application/commands/bulk-assign.command';
import { UpdatePersonalMessageCommand } from '../../application/commands/update-personal-message.command';
import { GetKeepsakeAssignmentsQuery } from '../../application/queries/get-keepsake-assignments.query';
import {
  BulkAssignDto,
  UpdatePersonalMessageDto,
  AssignmentResponseDto,
} from '../dto/keepsake-assignment.dto';

@Controller('vault/keepsakes/:keepsakeId/assignments')
export class KeepsakeAssignmentController {
  constructor(
    private readonly bulkAssignCommand: BulkAssignCommand,
    private readonly updatePersonalMessageCommand: UpdatePersonalMessageCommand,
    private readonly getKeepsakeAssignmentsQuery: GetKeepsakeAssignmentsQuery,
  ) {}

  @Get()
  async getAssignments(
    @CurrentUser() user: AuthenticatedUser,
    @Param('keepsakeId') keepsakeId: string,
  ): Promise<{ assignments: AssignmentResponseDto[] }> {
    const result = await this.getKeepsakeAssignmentsQuery.execute({
      userId: user.id,
      keepsakeId,
    });

    if (result.isErr()) {
      throw new NotFoundException(result.error);
    }

    return {
      assignments: result.value.assignments.map((a) => ({
        id: a.id,
        keepsakeId: a.keepsakeId,
        beneficiaryId: a.beneficiaryId,
        beneficiaryFirstName: a.beneficiaryFirstName,
        beneficiaryLastName: a.beneficiaryLastName,
        beneficiaryFullName: a.beneficiaryFullName,
        beneficiaryEmail: a.beneficiaryEmail,
        beneficiaryRelationship: a.beneficiaryRelationship,
        personalMessage: a.personalMessage,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async bulkAssign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('keepsakeId') keepsakeId: string,
    @Body() dto: BulkAssignDto,
  ): Promise<{ success: boolean }> {
    const result = await this.bulkAssignCommand.execute({
      userId: user.id,
      keepsakeId,
      beneficiaryIds: dto.beneficiaryIds,
    });

    if (result.isErr()) {
      if (result.error === 'Keepsake not found') {
        throw new NotFoundException(result.error);
      }
      throw new BadRequestException(result.error);
    }

    return { success: true };
  }

  @Patch(':beneficiaryId')
  @HttpCode(HttpStatus.OK)
  async updatePersonalMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('keepsakeId') keepsakeId: string,
    @Param('beneficiaryId') beneficiaryId: string,
    @Body() dto: UpdatePersonalMessageDto,
  ): Promise<{ success: boolean }> {
    const result = await this.updatePersonalMessageCommand.execute({
      userId: user.id,
      keepsakeId,
      beneficiaryId,
      personalMessage: dto.personalMessage ?? null,
    });

    if (result.isErr()) {
      if (result.error === 'Keepsake not found' || result.error === 'Assignment not found') {
        throw new NotFoundException(result.error);
      }
      throw new BadRequestException(result.error);
    }

    return { success: true };
  }

  @Delete(':beneficiaryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unassign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('keepsakeId') keepsakeId: string,
    @Param('beneficiaryId') beneficiaryId: string,
  ): Promise<void> {
    const result = await this.bulkAssignCommand.execute({
      userId: user.id,
      keepsakeId,
      beneficiaryIds: [],
    });

    if (result.isErr()) {
      throw new NotFoundException(result.error);
    }
  }
}
