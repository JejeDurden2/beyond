'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/layout';
import { KeepsakeTypeIcon, ChevronRight, Plus } from '@/components/ui';
import {
  KeepsakeVisualization,
  useKeepsakeVisualization,
} from '@/components/features/visualizations';
import { getKeepsakes, getKeepsake } from '@/lib/api/keepsakes';
import { KEEPSAKE_TYPES, formatDate } from '@/lib/constants';
import type { KeepsakeSummary, KeepsakeType, Keepsake } from '@/types';

export default function KeepsakesPage() {
  const router = useRouter();
  const t = useTranslations('keepsakes');
  const { isTextBased } = useKeepsakeVisualization();

  const [keepsakes, setKeepsakes] = useState<KeepsakeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<KeepsakeType | 'all'>('all');

  // Visualization state
  const [selectedKeepsake, setSelectedKeepsake] = useState<Keepsake | null>(null);
  const [isLoadingKeepsake, setIsLoadingKeepsake] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKeepsakes();
        setKeepsakes(data.keepsakes);
      } catch {
        // Silent fail - empty state will be shown
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredKeepsakes =
    filterType === 'all' ? keepsakes : keepsakes.filter((k) => k.type === filterType);

  const handleKeepsakeClick = useCallback(
    async (keepsake: KeepsakeSummary) => {
      // For non-text keepsakes, go directly to edit page
      if (!isTextBased(keepsake.type)) {
        router.push(`/keepsakes/${keepsake.id}`);
        return;
      }

      // For text-based keepsakes, load full content and show visualization
      setIsLoadingKeepsake(true);
      try {
        const fullKeepsake = await getKeepsake(keepsake.id);
        setSelectedKeepsake(fullKeepsake);
      } catch {
        // On error, fallback to edit page
        router.push(`/keepsakes/${keepsake.id}`);
      } finally {
        setIsLoadingKeepsake(false);
      }
    },
    [isTextBased, router],
  );

  const handleCloseVisualization = useCallback(() => {
    setSelectedKeepsake(null);
  }, []);

  const handleEditFromVisualization = useCallback(() => {
    if (selectedKeepsake) {
      router.push(`/keepsakes/${selectedKeepsake.id}`);
    }
  }, [selectedKeepsake, router]);

  return (
    <AppShell requireAuth>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-display-sm text-foreground">{t('title')}</h1>
            <p className="text-muted-foreground mt-1">{t('count', { count: keepsakes.length })}</p>
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
            <FilterButton active={filterType === 'all'} onClick={() => setFilterType('all')}>
              {t('filter.all')}
            </FilterButton>
            {KEEPSAKE_TYPES.map((type) => (
              <FilterButton
                key={type}
                active={filterType === type}
                onClick={() => setFilterType(type)}
              >
                <KeepsakeTypeIcon type={type} className="w-4 h-4 inline mr-1" />{' '}
                {t(`types.${type}`)}
              </FilterButton>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border/50 p-6 animate-pulse"
              >
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
              <button
                key={keepsake.id}
                onClick={() => handleKeepsakeClick(keepsake)}
                disabled={isLoadingKeepsake}
                className="block w-full text-left bg-card rounded-2xl border border-border/50 shadow-soft p-6 transition-shadow duration-200 ease-out hover:shadow-soft-md disabled:opacity-70"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <KeepsakeTypeIcon type={keepsake.type} className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium text-foreground">{keepsake.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`types.${keepsake.type}`)} ·{' '}
                        {t('card.updatedAt', { date: formatDate(keepsake.updatedAt) })}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Visualization Modal */}
      {selectedKeepsake && (
        <KeepsakeVisualization
          type={selectedKeepsake.type}
          title={selectedKeepsake.title}
          content={selectedKeepsake.content || ''}
          onEdit={handleEditFromVisualization}
          onClose={handleCloseVisualization}
        />
      )}
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
          <Plus className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-xl text-foreground">{t('title')}</h3>
        <p className="text-muted-foreground">{t('description')}</p>
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
