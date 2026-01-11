import { Injectable, OnModuleInit } from '@nestjs/common';
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
  FileStoragePort,
  UploadFileInput,
  GenerateSignedUrlInput,
  SignedUrlResult,
} from '../../application/ports';

@Injectable()
export class R2FileStorageAdapter implements FileStoragePort, OnModuleInit {
  private client!: S3Client;
  private bucket!: string;
  private defaultExpiresIn!: number;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const accountId = this.configService.getOrThrow<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = this.configService.getOrThrow<string>('R2_BUCKET_NAME');
    this.defaultExpiresIn = this.configService.get<number>('R2_SIGNED_URL_EXPIRES_IN', 600); // 10 minutes default

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async upload(input: UploadFileInput): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: input.key,
      Body: input.data,
      ContentType: input.mimeType,
    });

    await this.client.send(command);
  }

  async generateSignedUrl(input: GenerateSignedUrlInput): Promise<SignedUrlResult> {
    const expiresIn = input.expiresInSeconds ?? this.defaultExpiresIn;

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: input.key,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn });
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return { url, expiresAt };
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
      },
    });

    await this.client.send(command);
  }
}
