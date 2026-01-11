'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/layout';
import { RelationshipIcon, ChevronRight } from '@/components/ui';
import { UserPlus } from 'lucide-react';
import { useBeneficiaries } from '@/hooks/use-beneficiaries';
import type { Beneficiary } from '@/types';

export default function BeneficiariesPage() {
  const t = useTranslations('beneficiaries');
  const { data, isLoading } = useBeneficiaries();
  const beneficiaries = data?.beneficiaries ?? [];

  return (
    <AppShell requireAuth>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-display-sm text-foreground">{t('title')}</h1>
            <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
          </div>
          <Link
            href="/beneficiaries/new"
            className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-5 py-2.5 text-sm font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md"
          >
            + {t('add')}
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border/50 p-6 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-5 w-48 bg-muted rounded" />
                    <div className="h-4 w-32 bg-muted rounded mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : beneficiaries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {beneficiaries.map((beneficiary) => (
              <BeneficiaryCard key={beneficiary.id} beneficiary={beneficiary} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function BeneficiaryCard({ beneficiary }: { beneficiary: Beneficiary }) {
  const t = useTranslations('beneficiaries');

  return (
    <Link
      href={`/beneficiaries/${beneficiary.id}`}
      className="block bg-card rounded-2xl border border-border/50 shadow-soft p-6 transition-shadow duration-200 ease-out hover:shadow-soft-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <RelationshipIcon
              relationship={beneficiary.relationship}
              className="w-6 h-6 text-muted-foreground"
            />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{beneficiary.fullName}</h3>
            <p className="text-sm text-muted-foreground">
              {t(`relationships.${beneficiary.relationship}`)} · {beneficiary.email}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('assignmentCount', { count: beneficiary.assignmentCount })}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </Link>
  );
}

function EmptyState() {
  const t = useTranslations('beneficiaries.empty');

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 md:p-12 text-center">
      <div className="max-w-sm mx-auto space-y-3 md:space-y-4">
        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-muted rounded-2xl flex items-center justify-center">
          <UserPlus className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg md:text-xl text-foreground">{t('title')}</h3>
        <p className="text-sm md:text-base text-muted-foreground">{t('description')}</p>
        <Link
          href="/beneficiaries/new"
          className="inline-block bg-foreground text-background hover:bg-foreground/90 rounded-xl px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md"
        >
          {t('cta')}
        </Link>
      </div>
    </div>
  );
}
