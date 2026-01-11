export class DecryptionParamsDto {
  key!: string;
  iv!: string;
  authTag!: string;
  algorithm!: string;
}

export class FileInfoDto {
  id!: string;
  filename!: string;
  mimeType!: string;
  size!: number;
}

export class GetFileUrlResponseDto {
  url!: string;
  expiresAt!: Date;
  decryption!: DecryptionParamsDto;
  file!: FileInfoDto;
}
