import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { VaultModule } from './modules/vault/vault.module';
import { KeepsakeModule } from './modules/keepsake/keepsake.module';
import { BeneficiaryModule } from './modules/beneficiary/beneficiary.module';

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
    SharedModule,
    AuthModule,
    VaultModule,
    KeepsakeModule,
    BeneficiaryModule,
  ],
})
export class AppModule {}
