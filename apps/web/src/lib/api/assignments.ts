import { apiClient } from './client';
import type { KeepsakeAssignment } from '@/types';

export interface GetAssignmentsResponse {
  assignments: KeepsakeAssignment[];
}

export async function getKeepsakeAssignments(keepsakeId: string): Promise<GetAssignmentsResponse> {
  return apiClient<GetAssignmentsResponse>(`/vault/keepsakes/${keepsakeId}/assignments`);
}

export async function bulkUpdateAssignments(
  keepsakeId: string,
  beneficiaryIds: string[],
): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/vault/keepsakes/${keepsakeId}/assignments`, {
    method: 'PUT',
    body: JSON.stringify({ beneficiaryIds }),
  });
}

export async function updatePersonalMessage(
  keepsakeId: string,
  beneficiaryId: string,
  personalMessage: string | null,
): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(
    `/vault/keepsakes/${keepsakeId}/assignments/${beneficiaryId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ personalMessage }),
    },
  );
}

export async function removeAssignment(keepsakeId: string, beneficiaryId: string): Promise<void> {
  return apiClient<void>(`/vault/keepsakes/${keepsakeId}/assignments/${beneficiaryId}`, {
    method: 'DELETE',
  });
}
