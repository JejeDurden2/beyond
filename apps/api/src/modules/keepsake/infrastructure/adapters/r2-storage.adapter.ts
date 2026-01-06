import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  StorageService,
  GenerateUploadUrlInput,
  PresignedUploadUrl,
  PresignedDownloadUrl,
} from '../../application/ports/storage.port';
import { randomUUID } from 'crypto';

@Injectable()
export class R2StorageAdapter implements StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly uploadUrlExpiresIn: number;
  private readonly downloadUrlExpiresIn: number;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.getOrThrow<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = this.configService.getOrThrow<string>('R2_BUCKET_NAME');

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.uploadUrlExpiresIn = this.configService.get<number>('R2_UPLOAD_URL_EXPIRES_IN', 3600);
    this.downloadUrlExpiresIn = this.configService.get<number>('R2_DOWNLOAD_URL_EXPIRES_IN', 3600);
  }

  async generateUploadUrl(input: GenerateUploadUrlInput): Promise<PresignedUploadUrl> {
    const extension = this.getFileExtension(input.filename);
    const key = this.generateKey(input.keepsakeId, extension);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: input.mimeType,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: this.uploadUrlExpiresIn,
    });

    const expiresAt = new Date(Date.now() + this.uploadUrlExpiresIn * 1000);

    return { url, key, expiresAt };
  }

  async generateDownloadUrl(key: string): Promise<PresignedDownloadUrl> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: this.downloadUrlExpiresIn,
    });

    const expiresAt = new Date(Date.now() + this.downloadUrlExpiresIn * 1000);

    return { url, expiresAt };
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async deleteObjects(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });

    await this.client.send(command);
  }

  private generateKey(keepsakeId: string, extension: string): string {
    const uuid = randomUUID();
    return `keepsakes/${keepsakeId}/${uuid}${extension}`;
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.substring(lastDot);
  }
}
