import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { SharedModule } from './shared/shared.module';
import { QueueModule } from './shared/queue/queue.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { VaultModule } from './modules/vault/vault.module';
import { KeepsakeModule } from './modules/keepsake/keepsake.module';
import { BeneficiaryModule } from './modules/beneficiary/beneficiary.module';
import { KeepsakeAssignmentModule } from './modules/keepsake-assignment/keepsake-assignment.module';
import { SecureFileModule } from './modules/secure-file/secure-file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    QueueModule,
    SharedModule,
    AuthModule,
    UserModule,
    VaultModule,
    KeepsakeModule,
    BeneficiaryModule,
    KeepsakeAssignmentModule,
    SecureFileModule,
  ],
})
export class AppModule {}
