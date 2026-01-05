import { Controller, Get, Param } from '@nestjs/common';

@Controller('beneficiaries')
export class BeneficiaryController {
  @Get('vault/:vaultId')
  async getByVaultId(@Param('vaultId') vaultId: string) {
    // TODO: Implement with handler
    return { vaultId, beneficiaries: [] };
  }
}
