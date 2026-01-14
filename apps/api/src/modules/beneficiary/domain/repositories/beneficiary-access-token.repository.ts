import { BeneficiaryAccessToken } from '../entities/beneficiary-access-token.entity';

export interface IBeneficiaryAccessTokenRepository {
  save(accessToken: BeneficiaryAccessToken): Promise<void>;
  findById(id: string): Promise<BeneficiaryAccessToken | null>;
  findByToken(token: string): Promise<BeneficiaryAccessToken | null>;
  findByBeneficiaryId(beneficiaryId: string): Promise<BeneficiaryAccessToken[]>;
  findValidByBeneficiaryId(beneficiaryId: string): Promise<BeneficiaryAccessToken | null>;
  delete(id: string): Promise<void>;
  deleteExpired(): Promise<number>;
}

export const BENEFICIARY_ACCESS_TOKEN_REPOSITORY = Symbol('BENEFICIARY_ACCESS_TOKEN_REPOSITORY');
