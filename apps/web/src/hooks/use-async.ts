'use client';

import { useState, useEffect, useCallback, type DependencyList } from 'react';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: DependencyList = [],
  options: UseAsyncOptions = {},
): AsyncState<T> & { refetch: () => Promise<void> } {
  const { immediate = true } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await asyncFn();
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, immediate]);

  return { ...state, refetch: execute };
}
