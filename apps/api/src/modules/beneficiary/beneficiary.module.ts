import { Module } from '@nestjs/common';
import { BeneficiaryController } from './infrastructure/controllers/beneficiary.controller';
import { PrismaBeneficiaryRepository } from './infrastructure/adapters/prisma-beneficiary.repository';

@Module({
  controllers: [BeneficiaryController],
  providers: [
    {
      provide: 'BeneficiaryRepository',
      useClass: PrismaBeneficiaryRepository,
    },
  ],
  exports: ['BeneficiaryRepository'],
})
export class BeneficiaryModule {}
