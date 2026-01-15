'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Eye } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { ArrowLeft } from '@/components/ui';
import { MediaUploader } from '@/components/features/media';
import { AssignmentSection } from '@/components/features/assignments';
import {
  KeepsakeVisualization,
  useKeepsakeVisualization,
} from '@/components/features/visualizations';
import { useKeepsakeAssignments } from '@/hooks/use-assignments';
import {
  getKeepsake,
  updateKeepsake,
  deleteKeepsake,
  getKeepsakeMedia,
  uploadMedia,
  deleteMedia,
} from '@/lib/api/keepsakes';
import { formatDate } from '@/lib/constants';
import type { Keepsake, KeepsakeType, KeepsakeMedia, TriggerCondition } from '@/types';

export default function KeepsakeDetailPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const locale = useLocale();
  const t = useTranslations('keepsakes');
  const tCommon = useTranslations('common');

  const [keepsake, setKeepsake] = useState<Keepsake | null>(null);
  const [media, setMedia] = useState<KeepsakeMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [triggerCondition, setTriggerCondition] = useState<TriggerCondition>('on_death');
  const [scheduledAt, setScheduledAt] = useState('');
  const [revealDelay, setRevealDelay] = useState<number | ''>('');
  const [showPreview, setShowPreview] = useState(false);

  // Fetch assignments for preview
  const { data: assignmentsData } = useKeepsakeAssignments(id);
  const { hasVisualization } = useKeepsakeVisualization();

  useEffect(() => {
    async function loadKeepsake() {
      try {
        const data = await getKeepsake(id);
        setKeepsake(data);
        setTitle(data.title);
        setContent(data.content || '');
        setTriggerCondition(data.triggerCondition);
        setScheduledAt(data.scheduledAt ? data.scheduledAt.split('T')[0] : '');
        setRevealDelay(data.revealDelay ?? '');

        // Load media for document/photo/video types
        if (['document', 'photo', 'video'].includes(data.type)) {
          const mediaResponse = await getKeepsakeMedia(id);
          setMedia(mediaResponse.media);
        }
      } catch (err) {
        console.error('Failed to load keepsake:', err);
        setError(tCommon('error'));
      } finally {
        setIsLoading(false);
      }
    }
    loadKeepsake();
  }, [id, tCommon]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keepsake) return;

    setIsSaving(true);
    setError(null);

    try {
      const updated = await updateKeepsake(id, {
        title,
        content,
        triggerCondition,
        scheduledAt: triggerCondition === 'on_date' && scheduledAt ? scheduledAt : null,
        revealDelay: revealDelay ? Number(revealDelay) : null,
      });
      setKeepsake({ ...keepsake, ...updated });
    } catch {
      setError(tCommon('error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteKeepsake(id);
      router.push('/keepsakes');
    } catch {
      setError(tCommon('error'));
      setIsDeleting(false);
    }
  };

  const handleMediaUpload = useCallback(
    async (files: File[]) => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        const newMedia = await uploadMedia({
          keepsakeId: id,
          files,
          onProgress: setUploadProgress,
        });
        setMedia((prev) => [...prev, ...newMedia]);
      } catch (err) {
        console.error('Upload failed:', err);
        setError(t('media.errors.uploadFailed'));
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [id, t],
  );

  const handleMediaRemove = useCallback(
    async (mediaId: string) => {
      try {
        await deleteMedia(id, mediaId);
        setMedia((prev) => prev.filter((m) => m.id !== mediaId));
      } catch (err) {
        console.error('Failed to delete media:', err);
        setError(tCommon('error'));
      }
    },
    [id, tCommon],
  );

  // Determine which fields to show based on type
  const isTextBased = keepsake && ['letter', 'wish'].includes(keepsake.type);
  const isMediaBased = keepsake && ['document', 'photo', 'video'].includes(keepsake.type);
  const isScheduledAction = keepsake?.type === 'scheduled_action';

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
    if (!keepsake) {
      return t('form.contentPlaceholder');
    }

    switch (keepsake.type) {
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

  if (isLoading) {
    return (
      <AppShell requireAuth>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-10 w-64 bg-muted rounded" />
            <div className="bg-card rounded-2xl border border-border/50 p-8 space-y-6">
              <div className="h-12 bg-muted rounded-xl" />
              <div className="h-64 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!keepsake) {
    return (
      <AppShell requireAuth>
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <h1 className="font-display text-display-sm text-foreground mb-4">
            {t('notFound.title')}
          </h1>
          <Link
            href="/keepsakes"
            className="text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> {t('notFound.back')}
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell requireAuth>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/keepsakes"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> {tCommon('back')}
          </Link>
        </div>

        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-display text-display-sm text-foreground">
                {t('edit.title', { type: t(`types.${keepsake.type as KeepsakeType}`) })}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('edit.createdAt', { date: formatDate(keepsake.createdAt, locale) })} ·{' '}
                {t('edit.updatedAt', { date: formatDate(keepsake.updatedAt, locale) })}
              </p>
            </div>

            {/* View as recipient button - for all visualizable keepsakes */}
            {keepsake && hasVisualization(keepsake.type) && (
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center gap-2 border border-border/60 text-foreground rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 ease-out hover:bg-muted/50"
              >
                <Eye className="w-4 h-4" />
                {t('edit.viewAsRecipient')}
              </button>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8">
            <form onSubmit={handleSave} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

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
                />
              </div>

              {/* Media Uploader - for photo/video types */}
              {isMediaBased && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    {t('media.title')}
                  </label>
                  <MediaUploader
                    media={media}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    onUpload={handleMediaUpload}
                    onRemove={handleMediaRemove}
                    maxFiles={keepsake.type === 'video' ? 5 : 20}
                  />
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

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200 ease-out"
                >
                  {t('delete.button')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !title || (isContentRequired && !content)}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 py-3 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? t('edit.saving') : t('edit.save')}
                </button>
              </div>
            </form>
          </div>

          {/* Assignment Section */}
          <AssignmentSection keepsakeId={id} />
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-card rounded-2xl border border-border/50 shadow-soft-lg p-8 max-w-md w-full animate-slide-up">
              <h2 className="font-display text-xl text-foreground mb-2">{t('delete.title')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('delete.description', { title: keepsake.title })}
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border border-border/60 text-foreground rounded-xl px-6 py-3 font-medium transition-colors duration-200 ease-out hover:bg-muted/50"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 text-white hover:bg-red-700 rounded-xl px-6 py-3 font-medium transition-colors duration-200 ease-out disabled:opacity-50"
                >
                  {isDeleting ? t('delete.deleting') : t('delete.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View as recipient visualization */}
        {showPreview && keepsake && hasVisualization(keepsake.type) && (
          <KeepsakeVisualization
            type={keepsake.type}
            title={title}
            content={content}
            media={media}
            recipientName={assignmentsData?.assignments?.[0]?.beneficiaryFullName}
            personalMessage={assignmentsData?.assignments?.[0]?.personalMessage ?? undefined}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </AppShell>
  );
}
