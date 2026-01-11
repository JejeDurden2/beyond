export class SecureFileItemDto {
  id!: string;
  filename!: string;
  mimeType!: string;
  size!: number;
  createdAt!: Date;
}

export class ListFilesResponseDto {
  files!: SecureFileItemDto[];
}
