'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Eye } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { ErrorAlert, KeepsakeTypeIcon, ArrowLeft, MediaTypeIcon } from '@/components/ui';
import { RecipientSelector, type RecipientWithMessage } from '@/components/features/keepsakes';
import { KeepsakeVisualization } from '@/components/features/visualizations';
import { createKeepsake, uploadMedia } from '@/lib/api/keepsakes';
import { bulkUpdateAssignments, updatePersonalMessage } from '@/lib/api/assignments';
import { KEEPSAKE_TYPES } from '@/lib/constants';
import { formatFileSize } from '@/lib/utils';
import { getAllowedMimeTypes } from '@/types';
import type { KeepsakeType, TriggerCondition } from '@/types';

interface SelectedFile {
  file: File;
  preview?: string;
}

export default function NewKeepsakePage(): React.ReactElement {
  const router = useRouter();
  const t = useTranslations('keepsakes');
  const tCommon = useTranslations('common');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flow state
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [showNoRecipientsWarning, setShowNoRecipientsWarning] = useState(false);

  // Keepsake data
  const [selectedType, setSelectedType] = useState<KeepsakeType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [triggerCondition, setTriggerCondition] = useState<TriggerCondition>('on_death');
  const [scheduledAt, setScheduledAt] = useState('');
  const [revealDelay, setRevealDelay] = useState<number | ''>('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);

  // Recipients with personal messages
  const [selectedRecipients, setSelectedRecipients] = useState<RecipientWithMessage[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleTypeSelect = (type: KeepsakeType): void => {
    setSelectedType(type);
    setStep(2);
  };

  const handleFileSelect = useCallback((files: FileList | null): void => {
    if (!files) return;
    const newFiles: SelectedFile[] = Array.from(files).map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((index: number): void => {
    setSelectedFiles((prev) => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent): void => {
      e.preventDefault();
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const handleCreateClick = (): void => {
    if (selectedRecipients.length === 0) {
      setShowNoRecipientsWarning(true);
    } else if (['letter', 'wish'].includes(selectedType ?? '') && selectedRecipients.length > 0) {
      setShowPreview(true);
    } else {
      handleSubmit();
    }
  };

  const handlePreviewClick = (): void => {
    if (selectedRecipients.length > 0) {
      setShowPreview(true);
    }
  };

  const handleSubmitWithoutRecipients = async (): Promise<void> => {
    setShowNoRecipientsWarning(false);
    await handleSubmit();
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedType || !title) return;

    const isTextBased = ['letter', 'wish'].includes(selectedType);
    if (isTextBased && !content) return;

    const isMediaBased = ['document', 'photo', 'video'].includes(selectedType);
    if (isMediaBased && selectedFiles.length === 0) return;

    setIsLoading(true);
    setError(null);
    setShowPreview(false);

    try {
      // Create the keepsake
      const keepsake = await createKeepsake({
        type: selectedType,
        title,
        content: content || '',
        triggerCondition,
        scheduledAt: triggerCondition === 'on_date' && scheduledAt ? scheduledAt : undefined,
        revealDelay: revealDelay ? Number(revealDelay) : undefined,
      });

      // Upload media if applicable
      if (isMediaBased && selectedFiles.length > 0) {
        await uploadMedia({
          keepsakeId: keepsake.id,
          files: selectedFiles.map((sf) => sf.file),
          onProgress: setUploadProgress,
        });
      }

      // Assign recipients with personal messages
      if (selectedRecipients.length > 0) {
        const beneficiaryIds = selectedRecipients.map((r) => r.beneficiaryId);
        await bulkUpdateAssignments(keepsake.id, beneficiaryIds);

        // Update personal messages for each recipient
        for (const recipient of selectedRecipients) {
          if (recipient.personalMessage.trim()) {
            await updatePersonalMessage(
              keepsake.id,
              recipient.beneficiaryId,
              recipient.personalMessage.trim(),
            );
          }
        }
      }

      router.push('/keepsakes');
    } catch {
      setError(tCommon('error'));
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const typeLabel = selectedType ? t(`types.${selectedType}`) : '';

  // Type checks
  const isTextBased = selectedType && ['letter', 'wish'].includes(selectedType);
  const isMediaBased = selectedType && ['document', 'photo', 'video'].includes(selectedType);
  const isScheduledAction = selectedType === 'scheduled_action';

  function getContentLabel(): string {
    if (isMediaBased) return t('form.descriptionLabel');
    if (isScheduledAction) return t('form.instructionsLabel');
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
  const canSubmit =
    title && (!isContentRequired || content) && (!isMediaRequired || selectedFiles.length > 0);

  function getMediaTypeFromMime(mimeType: string): 'image' | 'video' | 'document' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  }

  // Get preview recipient (first one with a message, or just first one)
  const previewRecipient =
    selectedRecipients.find((r) => r.personalMessage.trim()) || selectedRecipients[0];

  return (
    <AppShell requireAuth>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Step 1: Type Selection */}
        {step === 1 && (
          <>
            <div className="mb-8">
              <Link
                href="/keepsakes"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> {tCommon('back')}
              </Link>
            </div>

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
                    className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 text-center transition-all duration-200 ease-out hover:shadow-soft-md hover:border-accent/50 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent/20"
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
          </>
        )}

        {/* Step 2: Content + Recipients (integrated) */}
        {step === 2 && selectedType && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> {tCommon('back')}
              </button>
              <div className="flex items-center gap-2">
                <KeepsakeTypeIcon type={selectedType} className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{typeLabel}</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="font-display text-display-sm text-foreground">{typeLabel}</h1>
            </div>

            {error && (
              <div className="max-w-2xl mx-auto">
                <ErrorAlert message={error} />
              </div>
            )}

            {/* Two-column layout on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column: Content form */}
              <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 lg:p-8">
                <h2 className="font-medium text-foreground mb-4">{t('form.contentLabel')}</h2>

                <div className="space-y-5">
                  {/* Title */}
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

                  {/* Media uploader */}
                  {isMediaBased && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        {t('media.title')}
                      </label>
                      <button
                        type="button"
                        className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
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
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{t('media.dropzone')}</div>
                            <div className="text-xs text-muted-foreground">
                              {t('media.dropzoneHint')}
                            </div>
                          </div>
                        )}
                      </button>

                      {selectedFiles.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {selectedFiles.map((sf, index) => (
                            <div
                              key={index}
                              className="relative group border border-border rounded-lg p-2 bg-background"
                            >
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label={t('media.remove')}
                              >
                                ×
                              </button>
                              <div className="flex items-center gap-2">
                                <MediaTypeIcon
                                  mediaType={getMediaTypeFromMime(sf.file.type)}
                                  className="w-5 h-5 text-muted-foreground flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div
                                    className="text-xs font-medium truncate"
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

                  {/* Content/Description */}
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
                      rows={isTextBased ? 8 : 3}
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
                </div>
              </div>

              {/* Right column: Recipients */}
              <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 lg:p-8">
                <RecipientSelector
                  selectedRecipients={selectedRecipients}
                  onRecipientsChange={setSelectedRecipients}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => router.push('/keepsakes')}
                className="border border-border/60 text-foreground rounded-xl px-6 py-3 font-medium transition-colors duration-200 ease-out hover:bg-muted/50"
              >
                {tCommon('cancel')}
              </button>

              {/* Preview button - only for visualizable types with recipients */}
              {['letter', 'wish'].includes(selectedType) &&
                canSubmit &&
                selectedRecipients.length > 0 && (
                  <button
                    type="button"
                    onClick={handlePreviewClick}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 border border-border/60 text-foreground rounded-xl px-6 py-3 font-medium transition-colors duration-200 ease-out hover:bg-muted/50 disabled:opacity-50"
                  >
                    <Eye className="w-4 h-4" />
                    {t('form.preview')}
                  </button>
                )}

              <button
                type="button"
                onClick={handleCreateClick}
                disabled={!canSubmit || isLoading}
                className="bg-gold-heritage text-cream hover:bg-gold-soft rounded-xl px-6 py-3 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('form.creating') : t('form.create')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview visualization with confirm action */}
      {showPreview && selectedType && previewRecipient && (
        <>
          <KeepsakeVisualization
            type={selectedType}
            title={title}
            content={content}
            recipientName={previewRecipient.beneficiary.fullName}
            personalMessage={previewRecipient.personalMessage}
            onClose={() => setShowPreview(false)}
          />
          {/* Confirm action overlay */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex gap-3 animate-slide-up">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 font-medium transition-colors duration-200 ease-out border border-white/20"
            >
              {tCommon('back')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gold-heritage text-cream hover:bg-gold-soft font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? tCommon('loading') : t('form.confirmAndCreate')}
            </button>
          </div>
        </>
      )}

      {/* No recipients warning modal */}
      {showNoRecipientsWarning && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-card rounded-2xl border border-border/50 shadow-soft-lg p-8 max-w-md w-full animate-slide-up">
            <h2 className="font-display text-xl text-foreground mb-2">
              {t('form.noRecipientsWarning')}
            </h2>
            <p className="text-muted-foreground mb-6">{t('form.noRecipientsDescription')}</p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowNoRecipientsWarning(false)}
                className="border border-border/60 text-foreground rounded-xl px-5 py-2.5 font-medium transition-colors duration-200 ease-out hover:bg-muted/50"
              >
                {t('form.addRecipients')}
              </button>
              <button
                onClick={handleSubmitWithoutRecipients}
                disabled={isLoading}
                className="bg-gold-heritage text-cream hover:bg-gold-soft rounded-xl px-5 py-2.5 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50"
              >
                {isLoading ? t('form.creating') : t('form.continueWithout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
