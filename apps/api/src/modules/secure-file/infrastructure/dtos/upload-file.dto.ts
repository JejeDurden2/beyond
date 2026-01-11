import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UploadFileMetadataDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  filename!: string;
}

export class UploadFileResponseDto {
  id!: string;
  filename!: string;
  mimeType!: string;
  size!: number;
  createdAt!: Date;
}
