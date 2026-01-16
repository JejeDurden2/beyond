'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, ChevronRight, UserCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { BentoCard } from './BentoCard';
import type { Beneficiary } from '@/types';

interface WarningCardProps {
  children: React.ReactNode;
  href: string;
}

function WarningCard({ children, href }: WarningCardProps): React.ReactElement {
  return (
    <Link
      href={href}
      className="block relative rounded-2xl overflow-hidden shadow-lg shadow-amber-100/20 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
    >
      {/* Amber gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 via-yellow-50/40 to-white/20" />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

      {/* Amber-tinted border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-amber-200/50" />

      {/* Content */}
      <div className="relative p-6">{children}</div>
    </Link>
  );
}

interface TrustedPersonCardProps {
  beneficiaries: Beneficiary[];
  isLoading?: boolean;
}

export function TrustedPersonCard({
  beneficiaries,
  isLoading = false,
}: TrustedPersonCardProps): React.ReactElement {
  const t = useTranslations('dashboard.grid.trustedPerson');
  const tBeneficiaries = useTranslations('beneficiaries');

  const trustedPerson = beneficiaries.find((b) => b.isTrustedPerson);

  if (isLoading) {
    return (
      <BentoCard>
        <div className="space-y-3">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </div>
      </BentoCard>
    );
  }

  if (!trustedPerson) {
    return (
      <WarningCard href="/beneficiaries?configure=trusted">
        <div className="space-y-4">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {t('title')}
          </span>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-amber-700">{t('notConfigured')}</span>
          </div>

          <div className="flex items-center gap-1 text-sm font-medium text-amber-700">
            {t('configure')}
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </WarningCard>
    );
  }

  return (
    <BentoCard glassAccent="emerald" href="/beneficiaries">
      <div className="space-y-4">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {t('title')}
        </span>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100/70 backdrop-blur-sm border border-emerald-200/50 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-foreground">{trustedPerson.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {tBeneficiaries(`relationships.${trustedPerson.relationship}`)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{t('configured')}</span>
        </div>
      </div>
    </BentoCard>
  );
}
