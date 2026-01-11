import type { KeepsakeType } from '@/types';

// Use KeepsakeTypeIcon component from '@/components/ui' for icons
export const KEEPSAKE_TYPES: KeepsakeType[] = [
  'document',
  'letter',
  'photo',
  'video',
  'wish',
  'scheduled_action',
];

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  keepsakes: '/keepsakes',
  newKeepsake: '/keepsakes/new',
  keepsakeDetail: (id: string) => `/keepsakes/${id}`,
  settings: '/settings',
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  keepsakes: {
    list: '/keepsakes',
    create: '/keepsakes',
    get: (id: string) => `/keepsakes/${id}`,
    update: (id: string) => `/keepsakes/${id}`,
    delete: (id: string) => `/keepsakes/${id}`,
  },
} as const;

export function formatDate(dateStr: string, locale?: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale);
}
