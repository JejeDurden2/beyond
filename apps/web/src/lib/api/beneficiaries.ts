import { apiClient } from './client';
import type {
  Beneficiary,
  CreateBeneficiaryInput,
  UpdateBeneficiaryInput,
  BeneficiaryKeepsake,
} from '@/types';

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

export async function setTrustedPerson(id: string, isTrustedPerson: boolean): Promise<void> {
  return apiClient<void>(`/vault/beneficiaries/${id}/trusted-person`, {
    method: 'PATCH',
    body: JSON.stringify({ isTrustedPerson }),
  });
}

export interface GetBeneficiaryKeepsakesResponse {
  keepsakes: BeneficiaryKeepsake[];
}

export async function getBeneficiaryKeepsakes(
  beneficiaryId: string,
): Promise<GetBeneficiaryKeepsakesResponse> {
  return apiClient<GetBeneficiaryKeepsakesResponse>(
    `/vault/beneficiaries/${beneficiaryId}/keepsakes`,
  );
}
