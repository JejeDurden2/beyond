import type { KeepsakeType } from '@/types';

export const KEEPSAKE_TYPE_ICONS: Record<KeepsakeType, string> = {
  text: '📝',
  letter: '✉️',
  photo: '📷',
  video: '🎬',
  wish: '⭐',
  scheduled_action: '📅',
};

export const KEEPSAKE_TYPES: KeepsakeType[] = [
  'text',
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
