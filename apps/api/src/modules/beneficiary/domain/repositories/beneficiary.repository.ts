import { Beneficiary } from '../entities/beneficiary.entity';

export interface BeneficiaryRepository {
  findById(id: string): Promise<Beneficiary | null>;
  findByVaultId(vaultId: string): Promise<Beneficiary[]>;
  findByEmail(vaultId: string, email: string): Promise<Beneficiary | null>;
  findByAccessToken(token: string): Promise<Beneficiary | null>;
  save(beneficiary: Beneficiary): Promise<void>;
  delete(id: string): Promise<void>;
  countAssignments(beneficiaryId: string): Promise<number>;
}
