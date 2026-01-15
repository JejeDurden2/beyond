'use client';

import { useTranslations } from 'next-intl';
import { Plus, UserPlus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { BentoCard } from './BentoCard';

export function QuickActionsCard(): React.ReactElement {
  const t = useTranslations('dashboard.grid.quickActions');

  return (
    <BentoCard className="lg:col-span-3">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/keepsakes/new"
          className="flex-1 flex items-center justify-center gap-3 bg-gold-heritage text-cream hover:bg-gold-soft px-6 py-4 rounded-xl font-medium transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          {t('createKeepsake')}
        </Link>

        <Link
          href="/beneficiaries/new"
          className="flex-1 flex items-center justify-center gap-3 border border-border text-foreground hover:bg-muted/50 px-6 py-4 rounded-xl font-medium transition-all duration-200"
        >
          <UserPlus className="w-5 h-5" />
          {t('addBeneficiary')}
        </Link>
      </div>
    </BentoCard>
  );
}
