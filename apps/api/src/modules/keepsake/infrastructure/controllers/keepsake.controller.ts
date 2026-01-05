import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsString, IsEnum, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { CurrentUser } from '@/modules/auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '@/modules/auth/infrastructure/strategies/jwt.strategy';
import { CreateKeepsakeCommand } from '../../application/commands/create-keepsake.command';
import { UpdateKeepsakeCommand } from '../../application/commands/update-keepsake.command';
import { DeleteKeepsakeCommand } from '../../application/commands/delete-keepsake.command';
import { GetKeepsakesQuery } from '../../application/queries/get-keepsakes.query';
import { GetKeepsakeQuery } from '../../application/queries/get-keepsake.query';
import { KeepsakeType } from '../../domain/entities/keepsake.entity';

class CreateKeepsakeDto {
  @IsEnum(KeepsakeType)
  type!: KeepsakeType;

  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsNumber()
  revealDelay?: number;

  @IsOptional()
  @IsDateString()
  revealDate?: string;
}

class UpdateKeepsakeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  revealDelay?: number | null;

  @IsOptional()
  @IsDateString()
  revealDate?: string | null;
}

@Controller('keepsakes')
export class KeepsakeController {
  constructor(
    private readonly createKeepsakeCommand: CreateKeepsakeCommand,
    private readonly updateKeepsakeCommand: UpdateKeepsakeCommand,
    private readonly deleteKeepsakeCommand: DeleteKeepsakeCommand,
    private readonly getKeepsakesQuery: GetKeepsakesQuery,
    private readonly getKeepsakeQuery: GetKeepsakeQuery,
  ) {}

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateKeepsakeDto) {
    return this.createKeepsakeCommand.execute({
      userId: user.id,
      type: dto.type,
      title: dto.title,
      content: dto.content,
      revealDelay: dto.revealDelay,
      revealDate: dto.revealDate ? new Date(dto.revealDate) : undefined,
    });
  }

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.getKeepsakesQuery.execute({ userId: user.id });
  }

  @Get(':id')
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.getKeepsakeQuery.execute({
      userId: user.id,
      keepsakeId: id,
    });
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateKeepsakeDto,
  ) {
    return this.updateKeepsakeCommand.execute({
      userId: user.id,
      keepsakeId: id,
      title: dto.title,
      content: dto.content,
      revealDelay: dto.revealDelay,
      revealDate: dto.revealDate ? new Date(dto.revealDate) : undefined,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    await this.deleteKeepsakeCommand.execute({
      userId: user.id,
      keepsakeId: id,
    });
  }
}
