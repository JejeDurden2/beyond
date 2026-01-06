'use client';

import { useCallback, useRef } from 'react';
import Image from 'next/image';
import { MediaTypeIcon } from '@/components/ui';
import type { KeepsakeMedia } from '@/types';
import { getAllowedMimeTypes } from '@/types';

interface MediaUploaderProps {
  media: KeepsakeMedia[];
  isUploading: boolean;
  uploadProgress: number;
  onUpload: (files: File[]) => Promise<void>;
  onRemove: (mediaId: string) => Promise<void>;
  disabled?: boolean;
  maxFiles?: number;
}

export function MediaUploader({
  media,
  isUploading,
  uploadProgress,
  onUpload,
  onRemove,
  disabled = false,
  maxFiles = 20,
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        await onUpload(files);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onUpload],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (disabled || isUploading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await onUpload(files);
      }
    },
    [disabled, isUploading, onUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
  }, []);

  const canAddMore = media.length < maxFiles;

  return (
    <div className="space-y-4">
      {canAddMore && (
        <button
          type="button"
          className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            disabled || isUploading
              ? 'border-muted bg-muted/20 cursor-not-allowed'
              : 'border-border hover:border-foreground/30 cursor-pointer'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={getAllowedMimeTypes().join(',')}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isUploading}
          />

          {isUploading ? (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Uploading...</div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-foreground h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-lg font-medium">Drop files here or click to upload</div>
              <div className="text-sm text-muted-foreground">
                Images (10MB), Videos (500MB), PDFs (20MB)
              </div>
            </div>
          )}
        </button>
      )}

      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <MediaItem key={item.id} media={item} onRemove={() => onRemove(item.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface MediaItemProps {
  media: KeepsakeMedia;
  onRemove: () => void;
}

function MediaItem({ media, onRemove }: MediaItemProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="relative group border border-border rounded-lg p-3 bg-background">
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove"
      >
        ×
      </button>

      <div className="flex items-center gap-3">
        <MediaTypeIcon mediaType={media.type} className="w-6 h-6 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate" title={media.filename}>
            {media.filename}
          </div>
          <div className="text-xs text-muted-foreground">{formatFileSize(media.size)}</div>
        </div>
      </div>

      {media.type === 'image' && media.url && (
        <div className="mt-2 relative h-24 w-full">
          <Image
            src={media.url}
            alt={media.filename}
            fill
            className="object-cover rounded"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
