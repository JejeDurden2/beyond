export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Vault {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type KeepsakeType = 'text' | 'letter' | 'photo' | 'video' | 'wish' | 'scheduled_action';

export interface Keepsake {
  id: string;
  type: KeepsakeType;
  title: string;
  content?: string;
  revealDelay: number | null;
  revealDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KeepsakeSummary {
  id: string;
  type: KeepsakeType;
  title: string;
  revealDelay: number | null;
  revealDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKeepsakeInput {
  type: KeepsakeType;
  title: string;
  content: string;
  revealDelay?: number;
  revealDate?: string;
}

export interface UpdateKeepsakeInput {
  title?: string;
  content?: string;
  revealDelay?: number | null;
  revealDate?: string | null;
}
