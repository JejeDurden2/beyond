const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(`${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

const TEMP_ACCESS_KEY = 'beneficiaryTempAccess';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  // First check for JWT in localStorage (account-based access)
  const jwtToken = localStorage.getItem('accessToken');
  if (jwtToken) {
    return jwtToken;
  }

  // Fall back to temporary access token from session storage
  const tempAccessData = sessionStorage.getItem(TEMP_ACCESS_KEY);
  if (tempAccessData) {
    try {
      const data = JSON.parse(tempAccessData) as { accessToken: string; expiresAt: string };
      const expiresAt = new Date(data.expiresAt);
      if (expiresAt > new Date()) {
        return data.accessToken;
      }
      // Token expired, clear it
      sessionStorage.removeItem(TEMP_ACCESS_KEY);
    } catch {
      sessionStorage.removeItem(TEMP_ACCESS_KEY);
    }
  }

  return null;
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    throw new ApiError(response.status, response.statusText, data);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export { ApiError };
