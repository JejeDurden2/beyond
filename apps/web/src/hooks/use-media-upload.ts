'use client';

import { useState, useCallback } from 'react';
import { uploadMedia, deleteMedia, getKeepsakeMedia } from '@/lib/api/keepsakes';
import type { KeepsakeMedia } from '@/types';
import { getAllowedMimeTypes, getMediaTypeFromMime, getMaxFileSize } from '@/types';

export interface UseMediaUploadOptions {
  keepsakeId: string;
  onUploadComplete?: (media: KeepsakeMedia[]) => void;
  onError?: (error: Error) => void;
}

export interface MediaUploadState {
  media: KeepsakeMedia[];
  isUploading: boolean;
  isLoading: boolean;
  uploadProgress: number;
  error: Error | null;
}

export interface UseMediaUploadReturn extends MediaUploadState {
  upload: (files: File[]) => Promise<void>;
  remove: (mediaId: string) => Promise<void>;
  refresh: () => Promise<void>;
  validateFiles: (files: File[]) => {
    valid: File[];
    invalid: Array<{ file: File; reason: string }>;
  };
}

export function useMediaUpload({
  keepsakeId,
  onUploadComplete,
  onError,
}: UseMediaUploadOptions): UseMediaUploadReturn {
  const [state, setState] = useState<MediaUploadState>({
    media: [],
    isUploading: false,
    isLoading: false,
    uploadProgress: 0,
    error: null,
  });

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; invalid: Array<{ file: File; reason: string }> } => {
      const allowedTypes = getAllowedMimeTypes();
      const valid: File[] = [];
      const invalid: Array<{ file: File; reason: string }> = [];

      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          invalid.push({ file, reason: `Unsupported file type: ${file.type}` });
          continue;
        }

        const mediaType = getMediaTypeFromMime(file.type);
        if (!mediaType) {
          invalid.push({ file, reason: `Unknown media type` });
          continue;
        }

        const maxSize = getMaxFileSize(mediaType);
        if (file.size > maxSize) {
          const maxSizeMB = Math.round(maxSize / (1024 * 1024));
          invalid.push({ file, reason: `File exceeds ${maxSizeMB}MB limit` });
          continue;
        }

        valid.push(file);
      }

      return { valid, invalid };
    },
    [],
  );

  const upload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const { valid, invalid } = validateFiles(files);

      if (invalid.length > 0) {
        const errorMessage = invalid.map((i) => `${i.file.name}: ${i.reason}`).join('\n');
        const error = new Error(errorMessage);
        setState((prev) => ({ ...prev, error }));
        onError?.(error);
        return;
      }

      setState((prev) => ({
        ...prev,
        isUploading: true,
        uploadProgress: 0,
        error: null,
      }));

      try {
        const uploadedMedia = await uploadMedia({
          keepsakeId,
          files: valid,
          onProgress: (progress) => {
            setState((prev) => ({ ...prev, uploadProgress: progress }));
          },
        });

        setState((prev) => ({
          ...prev,
          media: [...prev.media, ...uploadedMedia],
          isUploading: false,
          uploadProgress: 100,
        }));

        onUploadComplete?.(uploadedMedia);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed');
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error,
        }));
        onError?.(error);
      }
    },
    [keepsakeId, validateFiles, onUploadComplete, onError],
  );

  const remove = useCallback(
    async (mediaId: string) => {
      try {
        await deleteMedia(keepsakeId, mediaId);
        setState((prev) => ({
          ...prev,
          media: prev.media.filter((m) => m.id !== mediaId),
        }));
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Delete failed');
        setState((prev) => ({ ...prev, error }));
        onError?.(error);
      }
    },
    [keepsakeId, onError],
  );

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { media } = await getKeepsakeMedia(keepsakeId);
      setState((prev) => ({
        ...prev,
        media,
        isLoading: false,
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load media');
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error,
      }));
      onError?.(error);
    }
  }, [keepsakeId, onError]);

  return {
    ...state,
    upload,
    remove,
    refresh,
    validateFiles,
  };
}
