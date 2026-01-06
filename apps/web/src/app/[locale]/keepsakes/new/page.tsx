'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/layout';
import { ErrorAlert } from '@/components/ui';
import { createKeepsake, uploadMedia } from '@/lib/api/keepsakes';
import { KEEPSAKE_TYPE_ICONS, KEEPSAKE_TYPES } from '@/lib/constants';
import { getAllowedMimeTypes } from '@/types';
import type { KeepsakeType, TriggerCondition } from '@/types';

interface SelectedFile {
  file: File;
  preview?: string;
}

export default function NewKeepsakePage() {
  const router = useRouter();
  const t = useTranslations('keepsakes');
  const tCommon = useTranslations('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<KeepsakeType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [triggerCondition, setTriggerCondition] = useState<TriggerCondition>('on_death');
  const [scheduledAt, setScheduledAt] = useState('');
  const [revealDelay, setRevealDelay] = useState<number | ''>('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleTypeSelect = (type: KeepsakeType) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles: SelectedFile[] = Array.from(files).map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !title) return;

    // For text-based types, content is required
    const isTextBased = ['text', 'letter', 'wish'].includes(selectedType);
    if (isTextBased && !content) return;

    // For media types, at least one file is required
    const isMediaBased = ['photo', 'video'].includes(selectedType);
    if (isMediaBased && selectedFiles.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create the keepsake first
      const keepsake = await createKeepsake({
        type: selectedType,
        title,
        content: content || '',
        triggerCondition,
        scheduledAt: triggerCondition === 'on_date' && scheduledAt ? scheduledAt : undefined,
        revealDelay: revealDelay ? Number(revealDelay) : undefined,
      });

      // If media type, upload the files
      if (isMediaBased && selectedFiles.length > 0) {
        await uploadMedia({
          keepsakeId: keepsake.id,
          files: selectedFiles.map((sf) => sf.file),
          onProgress: setUploadProgress,
        });
      }

      router.push('/keepsakes');
    } catch {
      setError(tCommon('error'));
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const typeLabel = selectedType ? t(`types.${selectedType}`) : '';

  // Determine which fields to show based on type
  const isTextBased = selectedType && ['text', 'letter', 'wish'].includes(selectedType);
  const isMediaBased = selectedType && ['photo', 'video'].includes(selectedType);
  const isScheduledAction = selectedType === 'scheduled_action';

  const getContentLabel = (): string => {
    if (isTextBased) return t('form.contentLabel');
    if (isMediaBased) return t('form.descriptionLabel');
    if (isScheduledAction) return t('form.instructionsLabel');
    return t('form.contentLabel');
  };

  const getContentPlaceholder = (): string => {
    if (selectedType === 'text') return t('form.textPlaceholder');
    if (selectedType === 'letter') return t('form.letterPlaceholder');
    if (selectedType === 'wish') return t('form.wishPlaceholder');
    if (isMediaBased) return t('form.descriptionPlaceholder');
    if (isScheduledAction) return t('form.instructionsPlaceholder');
    return t('form.contentPlaceholder');
  };

  const isContentRequired = isTextBased ?? false;
  const isMediaRequired = isMediaBased ?? false;
  const canSubmit =
    title && (!isContentRequired || content) && (!isMediaRequired || selectedFiles.length > 0);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AppShell requireAuth>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/keepsakes"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out inline-flex items-center gap-1"
          >
            ← {tCommon('back')}
          </Link>
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="font-display text-display-sm text-foreground">{t('new')}</h1>
              <p className="text-muted-foreground">{t('form.chooseType')}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {KEEPSAKE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 text-center transition-all duration-200 ease-out hover:shadow-soft-md hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <span className="text-3xl block mb-2">{KEEPSAKE_TYPE_ICONS[type]}</span>
                  <span className="font-medium text-foreground block">{t(`types.${type}`)}</span>
                  <span className="text-xs text-muted-foreground">
                    {t(`typeDescriptions.${type}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedType && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out"
              >
                ← {tCommon('back')}
              </button>
            </div>

            <div className="text-center space-y-2">
              <h1 className="font-display text-display-sm text-foreground">{typeLabel}</h1>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <ErrorAlert message={error} />}

                {/* Title - always shown */}
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-foreground">
                    {t('form.titleLabel')}
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                    placeholder={t('form.titlePlaceholder')}
                  />
                </div>

                {/* Media uploader - for photo/video types */}
                {isMediaBased && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      {t('media.title')}
                    </label>
                    <button
                      type="button"
                      className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                        isLoading
                          ? 'border-muted bg-muted/20 cursor-not-allowed'
                          : 'border-border hover:border-foreground/30 cursor-pointer'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => !isLoading && fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={getAllowedMimeTypes().join(',')}
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                        disabled={isLoading}
                      />

                      {isLoading && uploadProgress > 0 ? (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">{t('media.uploading')}</div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-foreground h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t('media.uploadProgress', { progress: Math.round(uploadProgress) })}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-lg font-medium">{t('media.dropzone')}</div>
                          <div className="text-sm text-muted-foreground">
                            {t('media.dropzoneHint')}
                          </div>
                        </div>
                      )}
                    </button>

                    {/* Selected files preview */}
                    {selectedFiles.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        {selectedFiles.map((sf, index) => (
                          <div
                            key={index}
                            className="relative group border border-border rounded-lg p-3 bg-background"
                          >
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label={t('media.remove')}
                            >
                              ×
                            </button>
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">
                                {sf.file.type.startsWith('image/')
                                  ? '🖼️'
                                  : sf.file.type.startsWith('video/')
                                    ? '🎬'
                                    : '📄'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div
                                  className="text-sm font-medium truncate"
                                  title={sf.file.name}
                                >
                                  {sf.file.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatFileSize(sf.file.size)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Content/Description - shown for all types but required only for text-based */}
                <div className="space-y-2">
                  <label htmlFor="content" className="block text-sm font-medium text-foreground">
                    {getContentLabel()}
                    {!isContentRequired && (
                      <span className="text-muted-foreground font-normal ml-1">
                        ({t('form.optional')})
                      </span>
                    )}
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required={isContentRequired}
                    rows={isTextBased ? 10 : 4}
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out resize-none"
                    placeholder={getContentPlaceholder()}
                  />
                </div>

                {/* Trigger Condition - for scheduled_action */}
                {isScheduledAction && (
                  <>
                    <div className="space-y-2">
                      <label
                        htmlFor="triggerCondition"
                        className="block text-sm font-medium text-foreground"
                      >
                        {t('schedule.triggerLabel')}
                      </label>
                      <select
                        id="triggerCondition"
                        value={triggerCondition}
                        onChange={(e) => setTriggerCondition(e.target.value as TriggerCondition)}
                        className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                      >
                        <option value="on_death">{t('trigger.on_death')}</option>
                        <option value="on_date">{t('trigger.on_date')}</option>
                        <option value="manual">{t('trigger.manual')}</option>
                      </select>
                    </div>

                    {triggerCondition === 'on_date' && (
                      <div className="space-y-2">
                        <label
                          htmlFor="scheduledAt"
                          className="block text-sm font-medium text-foreground"
                        >
                          {t('schedule.dateLabel')}
                        </label>
                        <input
                          id="scheduledAt"
                          type="date"
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                        />
                      </div>
                    )}

                    {triggerCondition === 'on_death' && (
                      <div className="space-y-2">
                        <label
                          htmlFor="revealDelay"
                          className="block text-sm font-medium text-foreground"
                        >
                          {t('schedule.delayLabel')}
                          <span className="text-muted-foreground font-normal ml-1">
                            ({t('form.optional')})
                          </span>
                        </label>
                        <input
                          id="revealDelay"
                          type="number"
                          min="0"
                          max="365"
                          value={revealDelay}
                          onChange={(e) =>
                            setRevealDelay(e.target.value ? Number(e.target.value) : '')
                          }
                          className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                          placeholder="0"
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-4 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => router.push('/keepsakes')}
                    className="border border-border/60 text-foreground rounded-xl px-6 py-3 font-medium transition-colors duration-200 ease-out hover:bg-muted/50"
                  >
                    {tCommon('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !canSubmit}
                    className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 py-3 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? t('form.creating') : t('form.create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
