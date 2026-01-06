import { apiClient } from './client';
import type {
  Keepsake,
  KeepsakeSummary,
  KeepsakeStatus,
  CreateKeepsakeInput,
  UpdateKeepsakeInput,
  UploadUrlRequest,
  UploadUrlResponse,
  ConfirmMediaUploadRequest,
  GetMediaResponse,
  KeepsakeMedia,
} from '@/types';

export interface GetKeepsakesResponse {
  keepsakes: KeepsakeSummary[];
}

export interface GetKeepsakesParams {
  status?: KeepsakeStatus;
}

export async function getKeepsakes(params?: GetKeepsakesParams): Promise<GetKeepsakesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) {
    searchParams.set('status', params.status);
  }
  const query = searchParams.toString();
  const endpoint = query ? `/keepsakes?${query}` : '/keepsakes';
  return apiClient<GetKeepsakesResponse>(endpoint);
}

export async function getKeepsake(id: string): Promise<Keepsake> {
  return apiClient<Keepsake>(`/keepsakes/${id}`);
}

export async function createKeepsake(input: CreateKeepsakeInput): Promise<Keepsake> {
  return apiClient<Keepsake>('/keepsakes', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateKeepsake(id: string, input: UpdateKeepsakeInput): Promise<Keepsake> {
  return apiClient<Keepsake>(`/keepsakes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deleteKeepsake(id: string): Promise<void> {
  return apiClient<void>(`/keepsakes/${id}`, {
    method: 'DELETE',
  });
}

export async function scheduleKeepsake(id: string): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/keepsakes/${id}/schedule`, {
    method: 'POST',
  });
}

export async function unscheduleKeepsake(id: string): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/keepsakes/${id}/unschedule`, {
    method: 'POST',
  });
}

export async function requestUploadUrl(
  keepsakeId: string,
  input: UploadUrlRequest,
): Promise<UploadUrlResponse> {
  return apiClient<UploadUrlResponse>(`/keepsakes/${keepsakeId}/media/upload-url`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function confirmMediaUpload(
  keepsakeId: string,
  input: ConfirmMediaUploadRequest,
): Promise<{ media: Array<{ id: string; key: string; filename: string; type: string; size: number; order: number }> }> {
  return apiClient(`/keepsakes/${keepsakeId}/media/confirm`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getKeepsakeMedia(keepsakeId: string): Promise<GetMediaResponse> {
  return apiClient<GetMediaResponse>(`/keepsakes/${keepsakeId}/media`);
}

export async function reorderMedia(
  keepsakeId: string,
  mediaIds: string[],
): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/keepsakes/${keepsakeId}/media/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ mediaIds }),
  });
}

export async function deleteMedia(keepsakeId: string, mediaId: string): Promise<void> {
  return apiClient<void>(`/keepsakes/${keepsakeId}/media/${mediaId}`, {
    method: 'DELETE',
  });
}

export async function uploadFileToR2(url: string, file: File): Promise<void> {
  const response = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }
}

export interface UploadMediaOptions {
  keepsakeId: string;
  files: File[];
  onProgress?: (progress: number) => void;
}

export async function uploadMedia({ keepsakeId, files, onProgress }: UploadMediaOptions): Promise<KeepsakeMedia[]> {
  const uploadedMedia: Array<{
    key: string;
    filename: string;
    mimeType: string;
    size: number;
  }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const { url, key } = await requestUploadUrl(keepsakeId, {
      filename: file.name,
      mimeType: file.type,
    });

    await uploadFileToR2(url, file);

    uploadedMedia.push({
      key,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    });

    if (onProgress) {
      onProgress(((i + 1) / files.length) * 100);
    }
  }

  const result = await confirmMediaUpload(keepsakeId, { media: uploadedMedia });

  return result.media.map((m) => ({
    id: m.id,
    keepsakeId,
    type: m.type as 'image' | 'video' | 'document',
    key: m.key,
    filename: m.filename,
    mimeType: uploadedMedia.find((u) => u.key === m.key)?.mimeType || '',
    size: m.size,
    order: m.order,
    createdAt: new Date().toISOString(),
  }));
}
