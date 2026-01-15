'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/layout';
import { KeepsakeTypeIcon, Plus, Pagination } from '@/components/ui';
import { KeepsakeCard } from '@/components/features/keepsakes';
import { getKeepsakes } from '@/lib/api/keepsakes';
import { KEEPSAKE_TYPES } from '@/lib/constants';
import type { KeepsakeSummary, KeepsakeType } from '@/types';

const ITEMS_PER_PAGE = 12;

export default function KeepsakesPage(): React.ReactElement {
  const router = useRouter();
  const t = useTranslations('keepsakes');

  const [keepsakes, setKeepsakes] = useState<KeepsakeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<KeepsakeType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadData(): Promise<void> {
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

  const filteredKeepsakes = useMemo(
    () => (filterType === 'all' ? keepsakes : keepsakes.filter((k) => k.type === filterType)),
    [keepsakes, filterType],
  );

  const totalPages = Math.ceil(filteredKeepsakes.length / ITEMS_PER_PAGE);

  const paginatedKeepsakes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredKeepsakes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredKeepsakes, currentPage]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  // Click goes directly to edit page
  const handleKeepsakeClick = (keepsake: KeepsakeSummary): void => {
    router.push(`/keepsakes/${keepsake.id}`);
  };

  return (
    <AppShell requireAuth>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-display-sm text-foreground">{t('title')}</h1>
            <p className="text-muted-foreground mt-1">{t('count', { count: keepsakes.length })}</p>
          </div>
          <Link
            href="/keepsakes/new"
            className="inline-flex items-center justify-center gap-2 bg-gold-heritage text-cream hover:bg-gold-soft rounded-xl px-5 py-2.5 text-sm font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md"
          >
            <Plus className="w-4 h-4" />
            {t('new')}
          </Link>
        </div>

        {/* Filters */}
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

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden animate-pulse"
              >
                <div className="h-24 bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredKeepsakes.length === 0 ? (
          <EmptyState hasKeepsakes={keepsakes.length > 0} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedKeepsakes.map((keepsake) => (
                <KeepsakeCard
                  key={keepsake.id}
                  keepsake={keepsake}
                  onClick={() => handleKeepsakeClick(keepsake)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

interface FilterButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function FilterButton({ children, active, onClick }: FilterButtonProps): React.ReactElement {
  const baseStyles =
    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ease-out';
  const activeStyles = active
    ? 'bg-foreground text-background'
    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50';

  return (
    <button onClick={onClick} className={`${baseStyles} ${activeStyles}`}>
      {children}
    </button>
  );
}

interface EmptyStateProps {
  hasKeepsakes: boolean;
}

function EmptyState({ hasKeepsakes }: EmptyStateProps): React.ReactElement {
  const t = useTranslations('keepsakes.empty');

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 md:p-12 text-center">
      <div className="max-w-sm mx-auto space-y-3 md:space-y-4">
        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-muted rounded-2xl flex items-center justify-center">
          <Plus className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg md:text-xl text-foreground">{t('title')}</h3>
        <p className="text-sm md:text-base text-muted-foreground">{t('description')}</p>
        {!hasKeepsakes && (
          <Link
            href="/keepsakes/new"
            className="inline-block bg-gold-heritage text-cream hover:bg-gold-soft rounded-xl px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md"
          >
            {t('cta')}
          </Link>
        )}
      </div>
    </div>
  );
}
