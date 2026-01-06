'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/layout';
import { ErrorAlert } from '@/components/ui';
import { createKeepsake } from '@/lib/api/keepsakes';
import { KEEPSAKE_TYPE_ICONS, KEEPSAKE_TYPES } from '@/lib/constants';
import type { KeepsakeType } from '@/types';

export default function NewKeepsakePage() {
  const router = useRouter();
  const t = useTranslations('keepsakes');
  const tCommon = useTranslations('common');
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<KeepsakeType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeSelect = (type: KeepsakeType) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !title || !content) return;

    setIsLoading(true);
    setError(null);

    try {
      await createKeepsake({
        type: selectedType,
        title,
        content,
      });
      router.push('/keepsakes');
    } catch {
      setError(tCommon('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const typeLabel = selectedType ? t(`types.${selectedType}`) : '';

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
                {t('form.step', { current: 1, total: 1 })}
              </span>
            </div>

            <div className="text-center space-y-2">
              <h1 className="font-display text-display-sm text-foreground">{typeLabel}</h1>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <ErrorAlert message={error} />}

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

                <div className="space-y-2">
                  <label htmlFor="content" className="block text-sm font-medium text-foreground">
                    {t('form.contentLabel')}
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={10}
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out resize-none"
                    placeholder={t('form.contentPlaceholder')}
                  />
                </div>

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
                    disabled={isLoading || !title || !content}
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
