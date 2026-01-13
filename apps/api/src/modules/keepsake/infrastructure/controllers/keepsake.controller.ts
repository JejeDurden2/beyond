import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CurrentUser } from '@/modules/auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '@/modules/auth/infrastructure/strategies/jwt.strategy';
import { CreateKeepsakeCommand } from '../../application/commands/create-keepsake.command';
import { UpdateKeepsakeCommand } from '../../application/commands/update-keepsake.command';
import { DeleteKeepsakeCommand } from '../../application/commands/delete-keepsake.command';
import { DeliverKeepsakeCommand } from '../../application/commands/deliver-keepsake.command';
import { GetKeepsakesQuery } from '../../application/queries/get-keepsakes.query';
import { GetKeepsakeQuery } from '../../application/queries/get-keepsake.query';
import {
  KeepsakeType,
  KeepsakeStatus,
  TriggerCondition,
} from '../../domain/entities/keepsake.entity';
import { KeepsakeMedia } from '../../domain/entities/keepsake-media.entity';
import { Keepsake } from '../../domain/entities/keepsake.entity';
import {
  KEEPSAKE_REPOSITORY,
  KEEPSAKE_MEDIA_REPOSITORY,
  KeepsakeRepository,
  KeepsakeMediaRepository,
} from '../../domain/repositories/keepsake.repository';
import { STORAGE_SERVICE, StorageService } from '../../application/ports/storage.port';
import { VaultRepository } from '@/modules/vault/domain/repositories/vault.repository';

class CreateKeepsakeDto {
  @IsEnum(KeepsakeType)
  type!: KeepsakeType;

  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsEnum(TriggerCondition)
  triggerCondition?: TriggerCondition;

  @IsOptional()
  @IsNumber()
  revealDelay?: number;

  @IsOptional()
  @IsDateString()
  revealDate?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

class UpdateKeepsakeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(TriggerCondition)
  triggerCondition?: TriggerCondition;

  @IsOptional()
  @IsNumber()
  revealDelay?: number | null;

  @IsOptional()
  @IsDateString()
  revealDate?: string | null;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string | null;
}

class RequestUploadUrlDto {
  @IsString()
  filename!: string;

  @IsString()
  mimeType!: string;
}

class ConfirmMediaUploadDto {
  @IsString()
  key!: string;

  @IsString()
  filename!: string;

  @IsString()
  mimeType!: string;

  @IsInt()
  @Min(1)
  size!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

class ConfirmMediaUploadsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmMediaUploadDto)
  @ArrayMaxSize(20)
  media!: ConfirmMediaUploadDto[];
}

class ReorderMediaDto {
  @IsArray()
  @IsString({ each: true })
  mediaIds!: string[];
}

class GetKeepsakesQueryDto {
  @IsOptional()
  @IsEnum(KeepsakeStatus)
  status?: KeepsakeStatus;
}

@Controller('keepsakes')
export class KeepsakeController {
  constructor(
    private readonly createKeepsakeCommand: CreateKeepsakeCommand,
    private readonly updateKeepsakeCommand: UpdateKeepsakeCommand,
    private readonly deleteKeepsakeCommand: DeleteKeepsakeCommand,
    private readonly deliverKeepsakeCommand: DeliverKeepsakeCommand,
    private readonly getKeepsakesQuery: GetKeepsakesQuery,
    private readonly getKeepsakeQuery: GetKeepsakeQuery,
    @Inject(KEEPSAKE_REPOSITORY)
    private readonly keepsakeRepository: KeepsakeRepository,
    @Inject(KEEPSAKE_MEDIA_REPOSITORY)
    private readonly mediaRepository: KeepsakeMediaRepository,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: StorageService,
    @Inject('VaultRepository')
    private readonly vaultRepository: VaultRepository,
  ) {}

  private async getKeepsakeEntity(userId: string, keepsakeId: string): Promise<Keepsake | null> {
    const vault = await this.vaultRepository.findByUserId(userId);
    if (!vault) return null;

    const keepsake = await this.keepsakeRepository.findById(keepsakeId);
    if (!keepsake || keepsake.vaultId !== vault.id) return null;

    return keepsake;
  }

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateKeepsakeDto) {
    return this.createKeepsakeCommand.execute({
      userId: user.id,
      type: dto.type,
      title: dto.title,
      content: dto.content,
      triggerCondition: dto.triggerCondition,
      revealDelay: dto.revealDelay,
      revealDate: dto.revealDate ? new Date(dto.revealDate) : undefined,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    });
  }

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: GetKeepsakesQueryDto) {
    return this.getKeepsakesQuery.execute({
      userId: user.id,
      status: query.status,
    });
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
      triggerCondition: dto.triggerCondition,
      revealDelay: dto.revealDelay,
      revealDate: dto.revealDate ? new Date(dto.revealDate) : undefined,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    });
  }

  @Post(':id/schedule')
  @HttpCode(HttpStatus.OK)
  async schedule(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const keepsake = await this.getKeepsakeEntity(user.id, id);

    if (!keepsake) {
      return { error: 'Keepsake not found' };
    }

    const scheduleResult = keepsake.schedule();
    if (scheduleResult.isErr()) {
      return { error: scheduleResult.error };
    }

    await this.keepsakeRepository.save(keepsake);
    return { success: true };
  }

  @Post(':id/unschedule')
  @HttpCode(HttpStatus.OK)
  async unschedule(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const keepsake = await this.getKeepsakeEntity(user.id, id);

    if (!keepsake) {
      return { error: 'Keepsake not found' };
    }

    const unscheduleResult = keepsake.unschedule();
    if (unscheduleResult.isErr()) {
      return { error: unscheduleResult.error };
    }

    await this.keepsakeRepository.save(keepsake);
    return { success: true };
  }

  @Post(':id/deliver')
  @HttpCode(HttpStatus.OK)
  async deliver(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const result = await this.deliverKeepsakeCommand.executeManual(id, user.id);

    if (result.isErr()) {
      return { error: result.error };
    }

    return { success: true };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    await this.deleteKeepsakeCommand.execute({
      userId: user.id,
      keepsakeId: id,
    });
  }

  @Post(':id/media/upload-url')
  async requestUploadUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') keepsakeId: string,
    @Body() dto: RequestUploadUrlDto,
  ) {
    const keepsake = await this.getKeepsakeEntity(user.id, keepsakeId);

    if (!keepsake) {
      return { error: 'Keepsake not found' };
    }

    const allowedTypes = KeepsakeMedia.getAllowedMimeTypes();
    if (!allowedTypes.includes(dto.mimeType)) {
      return { error: `Unsupported file type: ${dto.mimeType}` };
    }

    const uploadUrl = await this.storageService.generateUploadUrl({
      keepsakeId,
      filename: dto.filename,
      mimeType: dto.mimeType,
    });

    return uploadUrl;
  }

  @Post(':id/media/confirm')
  async confirmMediaUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') keepsakeId: string,
    @Body() dto: ConfirmMediaUploadsDto,
  ) {
    const keepsake = await this.getKeepsakeEntity(user.id, keepsakeId);

    if (!keepsake) {
      return { error: 'Keepsake not found' };
    }

    const existingMedia = await this.mediaRepository.findByKeepsakeId(keepsakeId);
    const startOrder = existingMedia.length;

    const mediaEntities: KeepsakeMedia[] = [];
    const errors: string[] = [];

    for (let i = 0; i < dto.media.length; i++) {
      const item = dto.media[i];
      const result = KeepsakeMedia.create({
        keepsakeId,
        key: item.key,
        filename: item.filename,
        mimeType: item.mimeType,
        size: item.size,
        order: item.order ?? startOrder + i,
      });

      if (result.isErr()) {
        errors.push(`${item.filename}: ${result.error}`);
      } else {
        mediaEntities.push(result.value);
      }
    }

    if (errors.length > 0) {
      return { error: errors.join('; ') };
    }

    await this.mediaRepository.saveMany(mediaEntities);

    return {
      media: mediaEntities.map((m) => ({
        id: m.id,
        key: m.key,
        filename: m.filename,
        type: m.type,
        size: m.size,
        order: m.order,
      })),
    };
  }

  @Get(':id/media')
  async getMedia(@CurrentUser() user: AuthenticatedUser, @Param('id') keepsakeId: string) {
    const keepsake = await this.getKeepsakeEntity(user.id, keepsakeId);

    if (!keepsake) {
      return { error: 'Keepsake not found' };
    }

    const media = await this.mediaRepository.findByKeepsakeId(keepsakeId);

    const mediaWithUrls = await Promise.all(
      media.map(async (m) => {
        const downloadUrl = await this.storageService.generateDownloadUrl(m.key);
        return {
          id: m.id,
          key: m.key,
          filename: m.filename,
          type: m.type,
          mimeType: m.mimeType,
          size: m.size,
          order: m.order,
          url: downloadUrl.url,
          urlExpiresAt: downloadUrl.expiresAt,
        };
      }),
    );

    return { media: mediaWithUrls };
  }

  @Put(':id/media/reorder')
  async reorderMedia(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') keepsakeId: string,
    @Body() dto: ReorderMediaDto,
  ) {
    const keepsake = await this.getKeepsakeEntity(user.id, keepsakeId);

    if (!keepsake) {
      return { error: 'Keepsake not found' };
    }

    const media = await this.mediaRepository.findByKeepsakeId(keepsakeId);
    const mediaMap = new Map(media.map((m) => [m.id, m]));

    const reorderedMedia: KeepsakeMedia[] = [];
    for (let i = 0; i < dto.mediaIds.length; i++) {
      const mediaItem = mediaMap.get(dto.mediaIds[i]);
      if (mediaItem) {
        mediaItem.updateOrder(i);
        reorderedMedia.push(mediaItem);
      }
    }

    await this.mediaRepository.saveMany(reorderedMedia);

    return { success: true };
  }

  @Delete(':id/media/:mediaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedia(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') keepsakeId: string,
    @Param('mediaId') mediaId: string,
  ) {
    const keepsake = await this.getKeepsakeEntity(user.id, keepsakeId);

    if (!keepsake) {
      return;
    }

    const media = await this.mediaRepository.findById(mediaId);
    if (!media || media.keepsakeId !== keepsakeId) {
      return;
    }

    await this.storageService.deleteObject(media.key);
    await this.mediaRepository.delete(mediaId);
  }
}
