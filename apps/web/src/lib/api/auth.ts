import { apiClient, setToken, clearToken } from './client';
import type { AuthResponse, User } from '@/types';

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const response = await apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
    skipAuth: true,
  });
  setToken(response.accessToken);
  return response;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const response = await apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
    skipAuth: true,
  });
  setToken(response.accessToken);
  return response;
}

export async function getCurrentUser(): Promise<User> {
  return apiClient<User>('/auth/me');
}

export function logout(): void {
  clearToken();
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
  return apiClient<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(input),
    skipAuth: true,
  });
}

export async function resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
  return apiClient<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
    skipAuth: true,
  });
}
