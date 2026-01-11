import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../../auth/infrastructure/decorators';
import { AuthenticatedUser } from '../../../auth/infrastructure/strategies/jwt.strategy';
import { UploadSecureFileCommand } from '../../application/commands';
import { GetSecureFileUrlQuery, ListSecureFilesQuery } from '../../application/queries';
import { DeleteSecureFileCommand } from '../../application/commands';
import { UploadFileResponseDto, GetFileUrlResponseDto, ListFilesResponseDto } from '../dtos';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

@Controller('files')
export class SecureFileController {
  constructor(
    private readonly uploadCommand: UploadSecureFileCommand,
    private readonly deleteCommand: DeleteSecureFileCommand,
    private readonly getUrlQuery: GetSecureFileUrlQuery,
    private readonly listQuery: ListSecureFilesQuery,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadFileResponseDto> {
    return this.uploadCommand.execute({
      ownerId: user.id,
      filename: file.originalname,
      mimeType: file.mimetype,
      data: file.buffer,
    });
  }

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser): Promise<ListFilesResponseDto> {
    return this.listQuery.execute({ userId: user.id });
  }

  @Get(':id/url')
  async getUrl(
    @Param('id') fileId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GetFileUrlResponseDto> {
    return this.getUrlQuery.execute({
      fileId,
      userId: user.id,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') fileId: string, @CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.deleteCommand.execute({
      fileId,
      userId: user.id,
    });
  }
}
