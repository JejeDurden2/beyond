export interface Beneficiary {
  id: string;
  vaultId: string;
  name: string;
  email: string;
  relationship: string | null;
  accessedAt: string | null;
  createdAt: string;
}

export interface CreateBeneficiaryRequest {
  name: string;
  email: string;
  relationship?: string;
}

export interface UpdateBeneficiaryRequest {
  name?: string;
  email?: string;
  relationship?: string;
}
