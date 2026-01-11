'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBeneficiaries,
  getBeneficiary,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  getBeneficiaryKeepsakes,
} from '@/lib/api/beneficiaries';
import type { UpdateBeneficiaryInput } from '@/types';

export function useBeneficiaries() {
  return useQuery({
    queryKey: ['beneficiaries'],
    queryFn: getBeneficiaries,
  });
}

export function useBeneficiary(id: string) {
  return useQuery({
    queryKey: ['beneficiaries', id],
    queryFn: () => getBeneficiary(id),
    enabled: !!id,
  });
}

export function useCreateBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBeneficiary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });
}

export function useUpdateBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBeneficiaryInput }) =>
      updateBeneficiary(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries', id] });
    },
  });
}

export function useDeleteBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBeneficiary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });
}

export function useBeneficiaryKeepsakes(beneficiaryId: string) {
  return useQuery({
    queryKey: ['beneficiaries', beneficiaryId, 'keepsakes'],
    queryFn: () => getBeneficiaryKeepsakes(beneficiaryId),
    enabled: !!beneficiaryId,
  });
}
