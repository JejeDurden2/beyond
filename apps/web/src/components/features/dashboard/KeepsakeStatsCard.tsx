'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { BentoCard } from './BentoCard';
import type { KeepsakeSummary } from '@/types';

interface KeepsakeStatsCardProps {
  keepsakes: KeepsakeSummary[];
  isLoading?: boolean;
}

export function KeepsakeStatsCard({
  keepsakes,
  isLoading = false,
}: KeepsakeStatsCardProps): React.ReactElement {
  const t = useTranslations('dashboard.grid.keepsakeStats');

  const stats = {
    total: keepsakes.length,
    draft: keepsakes.filter((k) => k.status === 'draft').length,
    scheduled: keepsakes.filter((k) => k.status === 'scheduled').length,
    delivered: keepsakes.filter((k) => k.status === 'delivered').length,
  };

  return (
    <BentoCard href="/keepsakes">
      <div className="space-y-4">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {t('title')}
        </span>

        <p className="font-display text-3xl text-navy-deep">{isLoading ? '...' : stats.total}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
            <span>{t('draft', { count: stats.draft })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-gold-heritage" />
            <span>{t('scheduled', { count: stats.scheduled })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{t('delivered', { count: stats.delivered })}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm font-medium text-foreground">
          {t('viewAll')}
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </BentoCard>
  );
}
