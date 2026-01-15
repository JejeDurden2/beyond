'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight, Sparkles } from 'lucide-react';
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
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gold-heritage/10 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-gold-heritage" strokeWidth={1.5} />
          </div>
          <h3 className="font-serif-brand text-xl text-navy-deep mb-2">{t('empty.title')}</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">{t('empty.description')}</p>
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard className="lg:col-span-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-brand text-lg text-navy-deep">{t('title')}</h2>
          <Link
            href="/keepsakes"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('viewAll')}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted rounded-2xl h-56 animate-pulse" />
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
