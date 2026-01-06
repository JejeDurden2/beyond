'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/layout';
import { ErrorAlert } from '@/components/ui';
import { createKeepsake } from '@/lib/api/keepsakes';
import { KEEPSAKE_TYPE_ICONS, KEEPSAKE_TYPES } from '@/lib/constants';
import type { KeepsakeType, TriggerCondition } from '@/types';

export default function NewKeepsakePage() {
  const router = useRouter();
  const t = useTranslations('keepsakes');
  const tCommon = useTranslations('common');
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<KeepsakeType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [triggerCondition, setTriggerCondition] = useState<TriggerCondition>('on_death');
  const [scheduledAt, setScheduledAt] = useState('');
  const [revealDelay, setRevealDelay] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeSelect = (type: KeepsakeType) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !title) return;

    // For text-based types, content is required
    const isTextBased = ['text', 'letter', 'wish'].includes(selectedType);
    if (isTextBased && !content) return;

    setIsLoading(true);
    setError(null);

    try {
      const keepsake = await createKeepsake({
        type: selectedType,
        title,
        content: content || '',
        triggerCondition,
        scheduledAt: triggerCondition === 'on_date' && scheduledAt ? scheduledAt : undefined,
        revealDelay: revealDelay ? Number(revealDelay) : undefined,
      });

      // For media types, go to edit page to add media
      if (['photo', 'video'].includes(selectedType)) {
        router.push(`/keepsakes/${keepsake.id}`);
      } else {
        router.push('/keepsakes');
      }
    } catch {
      setError(tCommon('error'));
    } finally {
      setIsLoading(false);
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
              <span className="text-sm text-muted-foreground">
                {isMediaBased ? t('form.stepMedia', { current: 1, total: 2 }) : ''}
              </span>
            </div>

            <div className="text-center space-y-2">
              <h1 className="font-display text-display-sm text-foreground">{typeLabel}</h1>
              {isMediaBased && (
                <p className="text-sm text-muted-foreground">{t('form.mediaHint')}</p>
              )}
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

                {/* Content/Description - shown for all types */}
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
                    disabled={isLoading || !title || (isContentRequired && !content)}
                    className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 py-3 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading
                      ? t('form.creating')
                      : isMediaBased
                        ? t('form.continueToMedia')
                        : t('form.create')}
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
