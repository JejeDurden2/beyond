import { apiClient } from './client';

// Types
export interface BeneficiaryKeepsake {
  id: string;
  type: 'letter' | 'photo' | 'document' | 'wish';
  title: string;
  content: string;
  senderName: string;
  vaultId: string;
  deliveredAt: string;
  trigger: 'on_death' | 'on_date' | 'manual';
  hasPersonalMessage: boolean;
  personalMessage?: string;
}

export interface LinkedVault {
  vaultId: string;
  vaultOwnerName: string;
  isTrustedPersonFor: boolean;
  deathDeclared: boolean;
  deathDeclaredAt?: string;
}

export interface AccessInfo {
  isTemporaryAccess: boolean;
  canDeclareDeath: boolean;
  canManageInvitations: boolean;
}

export interface BeneficiaryDashboard {
  keepsakes: BeneficiaryKeepsake[];
  profile: {
    isTrustedPerson: boolean;
    linkedVaults: LinkedVault[];
  };
  accessInfo: AccessInfo;
}

export interface DeclareDeathResponse {
  success: boolean;
  declarationId: string;
  declaredAt: string;
}

export interface PendingBeneficiary {
  id: string;
  name: string;
  email: string;
  invitationStatus: 'pending' | 'accepted' | 'expired';
  invitationSentAt: string;
}

export interface InvitationInfo {
  token: string;
  beneficiary: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  keepsake: {
    id: string;
    title: string;
  };
  sender: {
    name: string;
  };
  expiresAt: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AcceptInvitationResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}

// API functions
export async function getBeneficiaryDashboard(): Promise<BeneficiaryDashboard> {
  return apiClient<BeneficiaryDashboard>('/beneficiary/portal/dashboard');
}

export async function getBeneficiaryKeepsake(id: string): Promise<BeneficiaryKeepsake> {
  return apiClient<BeneficiaryKeepsake>(`/beneficiary/portal/keepsakes/${id}`);
}

export async function recordKeepsakeView(id: string): Promise<void> {
  return apiClient<void>(`/beneficiary/portal/keepsakes/${id}/view`, {
    method: 'POST',
  });
}

export async function getInvitationInfo(token: string): Promise<InvitationInfo> {
  return apiClient<InvitationInfo>(`/beneficiary/auth/invitation/${token}`, {
    skipAuth: true,
  });
}

export async function acceptInvitation(
  data: AcceptInvitationRequest,
): Promise<AcceptInvitationResponse> {
  return apiClient<AcceptInvitationResponse>('/beneficiary/auth/accept-invitation', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

export async function beneficiaryLogin(
  email: string,
  password: string,
): Promise<{ accessToken: string }> {
  return apiClient<{ accessToken: string }>('/beneficiary/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
}

export async function getPendingBeneficiaries(vaultId: string): Promise<PendingBeneficiary[]> {
  return apiClient<PendingBeneficiary[]>(`/beneficiary/invitations/vault/${vaultId}/pending`);
}

export async function resendInvitation(invitationId: string): Promise<void> {
  return apiClient<void>(`/beneficiary/invitations/${invitationId}/resend`, {
    method: 'POST',
  });
}

export async function declareDeath(vaultId: string): Promise<DeclareDeathResponse> {
  return apiClient<DeclareDeathResponse>('/beneficiary/portal/declare-death', {
    method: 'POST',
    body: JSON.stringify({ vaultId }),
  });
}
