'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getKeepsakeAssignments,
  bulkUpdateAssignments,
  updatePersonalMessage,
  removeAssignment,
} from '@/lib/api/assignments';

export function useKeepsakeAssignments(keepsakeId: string) {
  return useQuery({
    queryKey: ['assignments', keepsakeId],
    queryFn: () => getKeepsakeAssignments(keepsakeId),
    enabled: !!keepsakeId,
  });
}

export function useBulkUpdateAssignments(keepsakeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (beneficiaryIds: string[]) => bulkUpdateAssignments(keepsakeId, beneficiaryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', keepsakeId] });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });
}

export function useUpdatePersonalMessage(keepsakeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      beneficiaryId,
      personalMessage,
    }: {
      beneficiaryId: string;
      personalMessage: string | null;
    }) => updatePersonalMessage(keepsakeId, beneficiaryId, personalMessage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', keepsakeId] });
    },
  });
}

export function useRemoveAssignment(keepsakeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (beneficiaryId: string) => removeAssignment(keepsakeId, beneficiaryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', keepsakeId] });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });
}
