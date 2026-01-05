import { Controller, Get } from '@nestjs/common';
import { GetVaultHandler } from '../../application/queries/get-vault.handler';
import { CurrentUser } from '@/modules/auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '@/modules/auth/infrastructure/strategies/jwt.strategy';

@Controller('vault')
export class VaultController {
  constructor(private readonly getVaultHandler: GetVaultHandler) {}

  @Get()
  async getMyVault(@CurrentUser() user: AuthenticatedUser) {
    return this.getVaultHandler.execute({ userId: user.id });
  }
}
