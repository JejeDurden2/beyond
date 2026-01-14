import { BeneficiaryInvitation } from '../entities/beneficiary-invitation.entity';

export interface IBeneficiaryInvitationRepository {
  save(invitation: BeneficiaryInvitation): Promise<void>;
  findById(id: string): Promise<BeneficiaryInvitation | null>;
  findByToken(token: string): Promise<BeneficiaryInvitation | null>;
  findByBeneficiaryId(beneficiaryId: string): Promise<BeneficiaryInvitation[]>;
  findPendingByVaultId(vaultId: string): Promise<BeneficiaryInvitation[]>;
  delete(id: string): Promise<void>;
}

export const BENEFICIARY_INVITATION_REPOSITORY = Symbol('BENEFICIARY_INVITATION_REPOSITORY');
