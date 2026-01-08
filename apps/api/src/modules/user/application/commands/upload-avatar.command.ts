import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { UserRepository, USER_REPOSITORY } from '../../../auth/domain/repositories/user.repository';

export interface UploadAvatarCommandInput {
  userId: string;
  filename: string;
  mimeType: string;
}

export interface UploadAvatarCommandOutput {
  uploadUrl: string;
  key: string;
  expiresAt: Date;
}

@Injectable()
export class UploadAvatarCommand {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly uploadUrlExpiresIn: number;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {
    const accountId = this.configService.getOrThrow<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = this.configService.getOrThrow<string>('R2_BUCKET_NAME');
    this.publicUrl = this.configService.getOrThrow<string>('R2_PUBLIC_URL');

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.uploadUrlExpiresIn = this.configService.get<number>('R2_UPLOAD_URL_EXPIRES_IN', 3600);
  }

  async execute(input: UploadAvatarCommandInput): Promise<UploadAvatarCommandOutput> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar if exists
    if (user.avatarUrl) {
      const oldKey = this.extractKeyFromUrl(user.avatarUrl);
      if (oldKey) {
        await this.deleteObject(oldKey);
      }
    }

    const extension = this.getFileExtension(input.filename);
    const key = `avatars/${input.userId}/${randomUUID()}${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: input.mimeType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: this.uploadUrlExpiresIn,
    });

    const expiresAt = new Date(Date.now() + this.uploadUrlExpiresIn * 1000);

    // Update user avatar URL
    const avatarUrl = `${this.publicUrl}/${key}`;
    user.setAvatarUrl(avatarUrl);
    await this.userRepository.save(user);

    return { uploadUrl, key, expiresAt };
  }

  private async deleteObject(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
    } catch {
      // Ignore deletion errors
    }
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove leading slash
    } catch {
      return null;
    }
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.substring(lastDot);
  }
}
