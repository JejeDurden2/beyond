'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight, UserCheck, UserPlus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { BentoCard } from './BentoCard';
import type { Beneficiary } from '@/types';

interface BeneficiaryStatsCardProps {
  beneficiaries: Beneficiary[];
  isLoading?: boolean;
}

export function BeneficiaryStatsCard({
  beneficiaries,
  isLoading = false,
}: BeneficiaryStatsCardProps): React.ReactElement {
  const t = useTranslations('dashboard.grid.beneficiaryStats');

  const hasTrustedPerson = beneficiaries.some((b) => b.isTrustedPerson);
  const isEmpty = beneficiaries.length === 0;

  if (isEmpty && !isLoading) {
    return (
      <BentoCard>
        <div className="space-y-4">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {t('title')}
          </span>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t('count', { count: 0 })}</p>
          </div>

          <Link
            href="/beneficiaries/new"
            className="inline-flex items-center gap-1 text-sm font-medium text-gold-heritage hover:text-gold-soft transition-colors"
          >
            {t('addFirst')}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard href="/beneficiaries">
      <div className="space-y-4">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {t('title')}
        </span>

        <p className="font-display text-3xl text-navy-deep">
          {isLoading ? '...' : beneficiaries.length}
        </p>

        <p className="text-sm text-muted-foreground">
          {t('count', { count: beneficiaries.length })}
        </p>

        {hasTrustedPerson && (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <UserCheck className="w-4 h-4" />
            <span>{t('trustedConfigured')}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-sm font-medium text-foreground">
          {t('manage')}
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </BentoCard>
  );
}
