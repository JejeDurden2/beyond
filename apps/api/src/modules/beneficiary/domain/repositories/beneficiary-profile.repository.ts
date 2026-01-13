import { BeneficiaryProfile } from '../entities/beneficiary-profile.entity';

export interface IBeneficiaryProfileRepository {
  save(profile: BeneficiaryProfile): Promise<void>;
  findById(id: string): Promise<BeneficiaryProfile | null>;
  findByUserId(userId: string): Promise<BeneficiaryProfile | null>;
  delete(id: string): Promise<void>;
}

export const BENEFICIARY_PROFILE_REPOSITORY = Symbol('BENEFICIARY_PROFILE_REPOSITORY');
