'use client';

import { useCallback, useEffect, useState } from 'react';

const TEMP_ACCESS_KEY = 'beneficiaryTempAccess';

interface TempAccessData {
  accessToken: string;
  expiresAt: string;
  beneficiaryId: string;
}

export function useBeneficiaryAccess() {
  const [isTemporaryAccess, setIsTemporaryAccess] = useState(false);
  const [tempAccessData, setTempAccessData] = useState<TempAccessData | null>(null);

  useEffect(() => {
    // Check for temporary access on mount
    const stored = sessionStorage.getItem(TEMP_ACCESS_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored) as TempAccessData;
        const expiresAt = new Date(data.expiresAt);

        if (expiresAt > new Date()) {
          setTempAccessData(data);
          setIsTemporaryAccess(true);
        } else {
          // Token expired, clear it
          sessionStorage.removeItem(TEMP_ACCESS_KEY);
        }
      } catch {
        sessionStorage.removeItem(TEMP_ACCESS_KEY);
      }
    }
  }, []);

  const setTemporaryAccess = useCallback((data: TempAccessData) => {
    sessionStorage.setItem(TEMP_ACCESS_KEY, JSON.stringify(data));
    setTempAccessData(data);
    setIsTemporaryAccess(true);
  }, []);

  const clearTemporaryAccess = useCallback(() => {
    sessionStorage.removeItem(TEMP_ACCESS_KEY);
    setTempAccessData(null);
    setIsTemporaryAccess(false);
  }, []);

  const getAccessToken = useCallback((): string | null => {
    // First check for JWT in localStorage (account-based access)
    const jwtToken = localStorage.getItem('accessToken');
    if (jwtToken) {
      return jwtToken;
    }

    // Fall back to temporary access token
    if (tempAccessData?.accessToken) {
      return tempAccessData.accessToken;
    }

    return null;
  }, [tempAccessData]);

  const hasValidAccess = useCallback((): boolean => {
    // Check for JWT first
    const jwtToken = localStorage.getItem('accessToken');
    if (jwtToken) {
      return true;
    }

    // Check for valid temporary access
    if (tempAccessData) {
      const expiresAt = new Date(tempAccessData.expiresAt);
      return expiresAt > new Date();
    }

    return false;
  }, [tempAccessData]);

  return {
    isTemporaryAccess,
    tempAccessData,
    setTemporaryAccess,
    clearTemporaryAccess,
    getAccessToken,
    hasValidAccess,
  };
}
