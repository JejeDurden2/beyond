import { apiClient } from './client';
import type { Beneficiary, CreateBeneficiaryInput, UpdateBeneficiaryInput } from '@/types';

export interface GetBeneficiariesResponse {
  beneficiaries: Beneficiary[];
}

export async function getBeneficiaries(): Promise<GetBeneficiariesResponse> {
  return apiClient<GetBeneficiariesResponse>('/vault/beneficiaries');
}

export async function getBeneficiary(id: string): Promise<Beneficiary> {
  return apiClient<Beneficiary>(`/vault/beneficiaries/${id}`);
}

export async function createBeneficiary(input: CreateBeneficiaryInput): Promise<Beneficiary> {
  return apiClient<Beneficiary>('/vault/beneficiaries', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateBeneficiary(
  id: string,
  input: UpdateBeneficiaryInput,
): Promise<Beneficiary> {
  return apiClient<Beneficiary>(`/vault/beneficiaries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteBeneficiary(id: string): Promise<void> {
  return apiClient<void>(`/vault/beneficiaries/${id}`, {
    method: 'DELETE',
  });
}
