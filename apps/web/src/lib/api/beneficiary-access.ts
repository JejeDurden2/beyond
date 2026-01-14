import { apiClient } from './client';

// Types
export interface BeneficiaryAccessInfo {
  beneficiaryId: string;
  beneficiaryEmail: string;
  beneficiaryName: string;
  isTrustedPerson: boolean;
  vaultOwnerName: string;
  keepsakeCount: number;
  hasAccount: boolean;
  invitationExpiresAt: string;
}

export interface TemporaryAccessResponse {
  accessToken: string;
  expiresAt: string;
  beneficiaryId: string;
}

// API functions
export async function getAccessInfo(token: string): Promise<BeneficiaryAccessInfo> {
  return apiClient<BeneficiaryAccessInfo>(`/beneficiary/access/${token}`, {
    skipAuth: true,
  });
}

export async function createTemporaryAccess(token: string): Promise<TemporaryAccessResponse> {
  return apiClient<TemporaryAccessResponse>(`/beneficiary/access/${token}/view`, {
    method: 'POST',
    skipAuth: true,
  });
}
