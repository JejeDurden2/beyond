'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/layout';
import { getKeepsakes } from '@/lib/api/keepsakes';
import type { KeepsakeSummary, KeepsakeType } from '@/types';

const typeIcons: Record<KeepsakeType, string> = {
  text: '📝',
  letter: '✉️',
  photo: '📷',
  video: '🎬',
  wish: '⭐',
  scheduled_action: '📅',
};

const keepsakeTypes: KeepsakeType[] = ['text', 'letter', 'photo', 'video', 'wish', 'scheduled_action'];

export default function KeepsakesPage() {
  const t = useTranslations('keepsakes');
  const [keepsakes, setKeepsakes] = useState<KeepsakeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<KeepsakeType | 'all'>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKeepsakes();
        setKeepsakes(data.keepsakes);
      } catch (error) {
        console.error('Failed to load keepsakes:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredKeepsakes = filterType === 'all'
    ? keepsakes
    : keepsakes.filter((k) => k.type === filterType);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <AppShell requireAuth>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-display-sm text-foreground">{t('title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('count', { count: keepsakes.length })}
            </p>
          </div>
          <Link
            href="/keepsakes/new"
            className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-5 py-2.5 text-sm font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md"
          >
            + {t('new')}
          </Link>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <FilterButton
              active={filterType === 'all'}
              onClick={() => setFilterType('all')}
            >
              {t('filter.all')}
            </FilterButton>
            {keepsakeTypes.map((type) => (
              <FilterButton
                key={type}
                active={filterType === type}
                onClick={() => setFilterType(type)}
              >
                {typeIcons[type]} {t(`types.${type}`)}
              </FilterButton>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-xl" />
                  <div className="flex-1">
                    <div className="h-5 w-48 bg-muted rounded" />
                    <div className="h-4 w-32 bg-muted rounded mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredKeepsakes.length === 0 ? (
          <EmptyState hasKeepsakes={keepsakes.length > 0} />
        ) : (
          <div className="space-y-4">
            {filteredKeepsakes.map((keepsake) => (
              <Link
                key={keepsake.id}
                href={`/keepsakes/${keepsake.id}`}
                className="block bg-card rounded-2xl border border-border/50 shadow-soft p-6 transition-shadow duration-200 ease-out hover:shadow-soft-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{typeIcons[keepsake.type]}</span>
                    <div>
                      <h3 className="font-medium text-foreground">{keepsake.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`types.${keepsake.type}`)} · {t('card.updatedAt', { date: formatDate(keepsake.updatedAt) })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ease-out ${
        active
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ hasKeepsakes }: { hasKeepsakes: boolean }) {
  const t = useTranslations('keepsakes.empty');

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-12 text-center">
      <div className="max-w-sm mx-auto space-y-4">
        <div className="w-16 h-16 mx-auto bg-muted rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="font-display text-xl text-foreground">
          {t('title')}
        </h3>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
        {!hasKeepsakes && (
          <Link
            href="/keepsakes/new"
            className="inline-block bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 py-3 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md"
          >
            {t('cta')}
          </Link>
        )}
      </div>
    </div>
  );
}
