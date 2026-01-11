import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Domain
import { SECURE_FILE_REPOSITORY } from './domain/repositories';

// Application
import { FILE_STORAGE_PORT, ENCRYPTION_PORT } from './application/ports';
import { UploadSecureFileCommand, DeleteSecureFileCommand } from './application/commands';
import { GetSecureFileUrlQuery, ListSecureFilesQuery } from './application/queries';

// Infrastructure
import {
  R2FileStorageAdapter,
  AesEncryptionAdapter,
  PrismaSecureFileRepository,
} from './infrastructure/adapters';
import { SecureFileController } from './infrastructure/controllers';

@Module({
  imports: [ConfigModule],
  controllers: [SecureFileController],
  providers: [
    // Commands
    UploadSecureFileCommand,
    DeleteSecureFileCommand,

    // Queries
    GetSecureFileUrlQuery,
    ListSecureFilesQuery,

    // Ports -> Adapters
    {
      provide: FILE_STORAGE_PORT,
      useClass: R2FileStorageAdapter,
    },
    {
      provide: ENCRYPTION_PORT,
      useClass: AesEncryptionAdapter,
    },
    {
      provide: SECURE_FILE_REPOSITORY,
      useClass: PrismaSecureFileRepository,
    },
  ],
  exports: [
    UploadSecureFileCommand,
    DeleteSecureFileCommand,
    GetSecureFileUrlQuery,
    ListSecureFilesQuery,
  ],
})
export class SecureFileModule {}
