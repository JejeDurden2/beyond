import { apiClient } from './client';
import type { User, UpdateProfileInput, ChangePasswordInput, AvatarUploadResponse } from '@/types';

export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  return apiClient<User>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function completeOnboarding(): Promise<{ onboardingCompletedAt: string }> {
  return apiClient<{ onboardingCompletedAt: string }>('/users/me/complete-onboarding', {
    method: 'POST',
  });
}

export async function getAvatarUploadUrl(
  filename: string,
  mimeType: string,
): Promise<AvatarUploadResponse> {
  return apiClient<AvatarUploadResponse>('/users/me/avatar', {
    method: 'POST',
    body: JSON.stringify({ filename, mimeType }),
  });
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiClient<{ success: boolean }>('/users/me/change-password', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteAccount(): Promise<void> {
  await apiClient<void>('/users/me', {
    method: 'DELETE',
  });
}

export interface ExportedUserData {
  exportedAt: string;
  format: 'json';
  gdprArticle: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    emailVerified: boolean;
    role: string;
    termsAcceptedAt: string | null;
    privacyPolicyAcceptedAt: string | null;
    termsVersion: string | null;
    onboardingCompletedAt: string | null;
    createdAt: string;
  };
  vault: {
    id: string;
    status: string;
    createdAt: string;
  } | null;
  keepsakes: Array<{
    id: string;
    type: string;
    title: string;
    status: string;
    triggerCondition: string;
    createdAt: string;
    updatedAt: string;
  }>;
  beneficiaries: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    relationship: string;
    note: string | null;
    isTrustedPerson: boolean;
    createdAt: string;
  }>;
  trustedContacts: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }>;
  secureFiles: Array<{
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    createdAt: string;
  }>;
  beneficiaryProfile: {
    id: string;
    isActive: boolean;
    receivedKeepsakes: Array<{
      keepsakeId: string;
      vaultOwnerEmail: string;
      assignedAt: string;
    }>;
  } | null;
}

export async function exportUserData(): Promise<ExportedUserData> {
  return apiClient<ExportedUserData>('/users/me/export', {
    method: 'GET',
  });
}
