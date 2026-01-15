'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight, UserCheck, UserPlus } from 'lucide-react';
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
      <BentoCard href="/beneficiaries/new">
        <div className="space-y-4">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {t('title')}
          </span>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-heritage/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-gold-heritage" />
            </div>
            <p className="text-sm text-muted-foreground">{t('empty')}</p>
          </div>

          <div className="flex items-center gap-1 text-sm font-medium text-gold-heritage">
            {t('addFirst')}
            <ChevronRight className="w-4 h-4" />
          </div>
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

        <div>
          <p className="font-display text-3xl text-navy-deep">
            {isLoading ? '...' : beneficiaries.length}
          </p>
          <p className="text-sm text-muted-foreground">{t('people')}</p>
        </div>

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
