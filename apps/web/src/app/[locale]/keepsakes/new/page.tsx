'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout';
import {
  ErrorAlert,
  KeepsakeTypeIcon,
  ArrowLeft,
  MediaTypeIcon,
  RelationshipIcon,
} from '@/components/ui';
import { createKeepsake, uploadMedia } from '@/lib/api/keepsakes';
import { bulkUpdateAssignments } from '@/lib/api/assignments';
import { KEEPSAKE_TYPES } from '@/lib/constants';
import { getAllowedMimeTypes } from '@/types';
import { useBeneficiaries } from '@/hooks/use-beneficiaries';
import type { KeepsakeType, TriggerCondition } from '@/types';

interface SelectedFile {
  file: File;
  preview?: string;
}

export default function NewKeepsakePage() {
  const router = useRouter();
  const t = useTranslations('keepsakes');
  const tCommon = useTranslations('common');
  const tBeneficiaries = useTranslations('beneficiaries');
  const tAssignments = useTranslations('assignments');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<KeepsakeType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [triggerCondition, setTriggerCondition] = useState<TriggerCondition>('on_death');
  const [scheduledAt, setScheduledAt] = useState('');
  const [revealDelay, setRevealDelay] = useState<number | ''>('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [selectedBeneficiaryIds, setSelectedBeneficiaryIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { data: beneficiariesData } = useBeneficiaries();
  const beneficiaries = beneficiariesData?.beneficiaries ?? [];

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

  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const toggleBeneficiary = (beneficiaryId: string) => {
    setSelectedBeneficiaryIds((prev) =>
      prev.includes(beneficiaryId)
        ? prev.filter((id) => id !== beneficiaryId)
        : [...prev, beneficiaryId],
    );
  };

  const handleSubmit = async () => {
    if (!selectedType || !title) return;

    // For text-based types, content is required
    const isTextBased = ['letter', 'wish'].includes(selectedType);
    if (isTextBased && !content) return;

    // For media types, at least one file is required
    const isMediaBased = ['document', 'photo', 'video'].includes(selectedType);
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

      // If beneficiaries selected, assign them
      if (selectedBeneficiaryIds.length > 0) {
        await bulkUpdateAssignments(keepsake.id, selectedBeneficiaryIds);
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
  const isTextBased = selectedType && ['letter', 'wish'].includes(selectedType);
  const isMediaBased = selectedType && ['document', 'photo', 'video'].includes(selectedType);
  const isScheduledAction = selectedType === 'scheduled_action';

  function getContentLabel(): string {
    if (isMediaBased) {
      return t('form.descriptionLabel');
    }
    if (isScheduledAction) {
      return t('form.instructionsLabel');
    }
    return t('form.contentLabel');
  }

  function getContentPlaceholder(): string {
    switch (selectedType) {
      case 'letter':
        return t('form.letterPlaceholder');
      case 'wish':
        return t('form.wishPlaceholder');
      case 'document':
      case 'photo':
      case 'video':
        return t('form.descriptionPlaceholder');
      case 'scheduled_action':
        return t('form.instructionsPlaceholder');
      default:
        return t('form.contentPlaceholder');
    }
  }

  const isContentRequired = isTextBased ?? false;
  const isMediaRequired = isMediaBased ?? false;
  const canProceedToStep3 =
    title && (!isContentRequired || content) && (!isMediaRequired || selectedFiles.length > 0);

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getMediaTypeFromMime(mimeType: string): 'image' | 'video' | 'document' {
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    if (mimeType.startsWith('video/')) {
      return 'video';
    }
    return 'document';
  }

  return (
    <AppShell requireAuth>
      <div className="max-w-2xl mx-auto px-6 py-12">
        {step === 1 && (
          <div className="mb-8">
            <Link
              href="/keepsakes"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> {tCommon('back')}
            </Link>
          </div>
        )}

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
                  <KeepsakeTypeIcon
                    type={type}
                    className="w-8 h-8 mx-auto mb-2 text-muted-foreground"
                  />
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
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> {tCommon('back')}
              </button>
              <span className="text-sm text-muted-foreground">
                {t('form.step', { current: 1, total: 2 })}
              </span>
            </div>

            <div className="text-center space-y-2">
              <h1 className="font-display text-display-sm text-foreground">{typeLabel}</h1>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8">
              <form onSubmit={handleDetailsNext} className="space-y-6">
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
                          <div className="text-sm text-muted-foreground">
                            {t('media.uploading')}
                          </div>
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
                              <MediaTypeIcon
                                mediaType={getMediaTypeFromMime(sf.file.type)}
                                className="w-6 h-6 text-muted-foreground"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium truncate" title={sf.file.name}>
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
                    disabled={!canProceedToStep3}
                    className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 py-3 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {tCommon('next')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {step === 3 && selectedType && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> {tCommon('back')}
              </button>
              <span className="text-sm text-muted-foreground">
                {t('form.step', { current: 2, total: 2 })}
              </span>
            </div>

            <div className="text-center space-y-2">
              <h1 className="font-display text-display-sm text-foreground">
                {tAssignments('whoReceives')}
              </h1>
              <p className="text-muted-foreground">{t('form.selectBeneficiaries')}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8">
              {error && (
                <div className="mb-6">
                  <ErrorAlert message={error} />
                </div>
              )}

              {beneficiaries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">{tAssignments('noBeneficiaries')}</p>
                  <Link
                    href="/beneficiaries/new"
                    className="inline-flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {tAssignments('addBeneficiary')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {beneficiaries.map((beneficiary) => {
                    const isSelected = selectedBeneficiaryIds.includes(beneficiary.id);
                    return (
                      <button
                        key={beneficiary.id}
                        type="button"
                        onClick={() => toggleBeneficiary(beneficiary.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-accent bg-accent/5'
                            : 'border-border/40 hover:border-border'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-accent/20' : 'bg-muted'
                          }`}
                        >
                          <RelationshipIcon
                            relationship={beneficiary.relationship}
                            className={`w-5 h-5 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">{beneficiary.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {tBeneficiaries(`relationships.${beneficiary.relationship}`)}
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-accent bg-accent text-white'
                              : 'border-border bg-background'
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  <Link
                    href="/beneficiaries/new"
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border/40 text-muted-foreground hover:border-border hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {tAssignments('createNew')}
                  </Link>
                </div>
              )}

              <div className="flex gap-4 justify-end pt-6 mt-6 border-t border-border/40">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="border border-border/60 text-foreground rounded-xl px-6 py-3 font-medium transition-colors duration-200 ease-out hover:bg-muted/50 disabled:opacity-50"
                >
                  {t('form.skipBeneficiaries')}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || selectedBeneficiaryIds.length === 0}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 py-3 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('form.creating') : t('form.create')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
