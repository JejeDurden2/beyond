/**
 * Shared response types for authentication commands and queries
 */

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  onboardingCompletedAt: Date | null;
  emailVerified: boolean;
  hasTotpEnabled: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUserResponse;
}
