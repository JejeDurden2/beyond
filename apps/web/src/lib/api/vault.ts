import { apiClient } from './client';
import type { Vault } from '@/types';

export async function getVault(): Promise<Vault> {
  return apiClient<Vault>('/vault');
}
