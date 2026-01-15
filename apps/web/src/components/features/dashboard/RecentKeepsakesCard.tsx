'use client';

import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { BentoCard } from './BentoCard';
import { KeepsakeCard } from '@/components/features/keepsakes/KeepsakeCard';
import type { KeepsakeSummary } from '@/types';

interface RecentKeepsakesCardProps {
  keepsakes: KeepsakeSummary[];
  isLoading?: boolean;
  onKeepsakeClick: (keepsake: KeepsakeSummary) => void;
}

export function RecentKeepsakesCard({
  keepsakes,
  isLoading = false,
  onKeepsakeClick,
}: RecentKeepsakesCardProps): React.ReactElement {
  const t = useTranslations('dashboard.grid.recentKeepsakes');

  const recentKeepsakes = keepsakes.slice(0, 3);
  const isEmpty = keepsakes.length === 0;

  if (isEmpty && !isLoading) {
    return (
      <BentoCard className="lg:col-span-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl text-foreground mb-2">{t('empty.title')}</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{t('empty.description')}</p>
          <Link
            href="/keepsakes/new"
            className="inline-block bg-gold-heritage text-cream hover:bg-gold-soft px-6 py-3 rounded-2xl font-medium transition-all duration-200"
          >
            {t('empty.cta')}
          </Link>
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard className="lg:col-span-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-foreground">{t('title')}</h2>
          <Link
            href="/keepsakes/new"
            className="inline-flex items-center gap-1.5 bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            {t('new')}
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentKeepsakes.map((keepsake) => (
              <KeepsakeCard
                key={keepsake.id}
                keepsake={keepsake}
                onClick={() => onKeepsakeClick(keepsake)}
              />
            ))}
          </div>
        )}
      </div>
    </BentoCard>
  );
}
