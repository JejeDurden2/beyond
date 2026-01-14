'use client';

import { Link } from '@/i18n/navigation';
import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Shield, ShieldOff } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { ArrowLeft, RelationshipIcon, KeepsakeTypeIcon, ChevronRight } from '@/components/ui';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useBeneficiary,
  useBeneficiaryKeepsakes,
  useSetTrustedPerson,
} from '@/hooks/use-beneficiaries';
import { formatDate } from '@/lib/constants';
import type { BeneficiaryKeepsake, KeepsakeType } from '@/types';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function BeneficiaryDetailPage({ params }: PageParams) {
  const { id } = use(params);
  const t = useTranslations('beneficiaries');
  const tCommon = useTranslations('common');

  const { data: beneficiary, isLoading: isLoadingBeneficiary } = useBeneficiary(id);
  const { data: keepsakesData, isLoading: isLoadingKeepsakes } = useBeneficiaryKeepsakes(id);
  const setTrustedPerson = useSetTrustedPerson();
  const [showTrustedDialog, setShowTrustedDialog] = useState(false);

  const keepsakes = keepsakesData?.keepsakes ?? [];
  const isLoading = isLoadingBeneficiary || isLoadingKeepsakes;

  const handleTrustedPersonToggle = () => {
    if (!beneficiary) return;
    setTrustedPerson.mutate(
      { id: beneficiary.id, isTrustedPerson: !beneficiary.isTrustedPerson },
      {
        onSuccess: () => setShowTrustedDialog(false),
        onError: (error) => {
          console.error('Failed to set trusted person:', error);
          setShowTrustedDialog(false);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <AppShell requireAuth>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
              <div className="h-6 w-32 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-16 bg-muted rounded-xl" />
              <div className="h-16 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!beneficiary) {
    return (
      <AppShell requireAuth>
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="font-display text-display-sm text-foreground">{t('notFound.title')}</h1>
          <Link
            href="/beneficiaries"
            className="text-sm text-muted-foreground hover:text-foreground mt-4 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> {t('notFound.back')}
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell requireAuth>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/beneficiaries"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> {tCommon('back')}
          </Link>
        </div>

        <div className="space-y-8 animate-fade-in">
          {/* Beneficiary header */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <RelationshipIcon
                    relationship={beneficiary.relationship}
                    className="w-7 h-7 text-accent"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-xl text-foreground">{beneficiary.fullName}</h1>
                    {beneficiary.isTrustedPerson && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded-full">
                        <Shield className="w-3 h-3" />
                        {t('trustedPerson.badge')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{beneficiary.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(`relationships.${beneficiary.relationship}`)}
                  </p>
                </div>
              </div>
              <Link
                href={`/beneficiaries/${id}/edit`}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title={t('edit')}
              >
                <Pencil className="w-5 h-5" />
              </Link>
            </div>
            {beneficiary.note && (
              <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border/50 italic">
                &ldquo;{beneficiary.note}&rdquo;
              </p>
            )}

            {/* Trusted Person Section */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground flex-1">
                  {t('trustedPerson.description')}
                </p>
                <Button
                  variant={beneficiary.isTrustedPerson ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => setShowTrustedDialog(true)}
                  disabled={setTrustedPerson.isPending}
                >
                  {beneficiary.isTrustedPerson ? (
                    <>
                      <ShieldOff className="w-4 h-4" />
                      {t('trustedPerson.unset')}
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      {t('trustedPerson.set')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Keepsakes section */}
          <div>
            <h2 className="font-display text-lg text-foreground mb-4">
              {t('detail.keepsakes', { count: keepsakes.length })}
            </h2>

            {keepsakes.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8 text-center">
                <p className="text-muted-foreground">{t('detail.noKeepsakes')}</p>
                <Link
                  href="/keepsakes/new"
                  className="inline-block mt-4 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  {t('detail.createKeepsake')}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {keepsakes.map((keepsake) => (
                  <KeepsakeRow key={keepsake.id} keepsake={keepsake} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trusted Person Confirmation Dialog */}
      <AlertDialog open={showTrustedDialog} onOpenChange={setShowTrustedDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {beneficiary.isTrustedPerson
                ? t('trustedPerson.confirmUnset.title')
                : t('trustedPerson.confirmSet.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {beneficiary.isTrustedPerson
                ? t('trustedPerson.confirmUnset.description')
                : t('trustedPerson.confirmSet.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTrustedPersonToggle}
              disabled={setTrustedPerson.isPending}
            >
              {setTrustedPerson.isPending
                ? '...'
                : beneficiary.isTrustedPerson
                  ? t('trustedPerson.confirmUnset.confirm')
                  : t('trustedPerson.confirmSet.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function KeepsakeRow({ keepsake }: { keepsake: BeneficiaryKeepsake }) {
  const tKeepsakes = useTranslations('keepsakes');

  return (
    <Link
      href={`/keepsakes/${keepsake.keepsakeId}`}
      className="block bg-card rounded-2xl border border-border/50 shadow-soft p-4 transition-shadow duration-200 ease-out hover:shadow-soft-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KeepsakeTypeIcon
            type={keepsake.keepsakeType as KeepsakeType}
            className="w-5 h-5 text-muted-foreground"
          />
          <div>
            <h3 className="font-medium text-foreground">{keepsake.keepsakeTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {tKeepsakes(`types.${keepsake.keepsakeType}`)} ·{' '}
              {tKeepsakes('card.updatedAt', { date: formatDate(keepsake.keepsakeUpdatedAt) })}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
      {keepsake.personalMessage && (
        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/40 italic">
          &ldquo;{keepsake.personalMessage}&rdquo;
        </p>
      )}
    </Link>
  );
}
