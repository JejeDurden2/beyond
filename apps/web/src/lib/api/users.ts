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
