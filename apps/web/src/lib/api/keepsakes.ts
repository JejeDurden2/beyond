import { apiClient } from './client';
import type { Keepsake, KeepsakeSummary, CreateKeepsakeInput, UpdateKeepsakeInput } from '@/types';

export interface GetKeepsakesResponse {
  keepsakes: KeepsakeSummary[];
}

export async function getKeepsakes(): Promise<GetKeepsakesResponse> {
  return apiClient<GetKeepsakesResponse>('/keepsakes');
}

export async function getKeepsake(id: string): Promise<Keepsake> {
  return apiClient<Keepsake>(`/keepsakes/${id}`);
}

export async function createKeepsake(input: CreateKeepsakeInput): Promise<Keepsake> {
  return apiClient<Keepsake>('/keepsakes', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateKeepsake(id: string, input: UpdateKeepsakeInput): Promise<Keepsake> {
  return apiClient<Keepsake>(`/keepsakes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deleteKeepsake(id: string): Promise<void> {
  return apiClient<void>(`/keepsakes/${id}`, {
    method: 'DELETE',
  });
}
