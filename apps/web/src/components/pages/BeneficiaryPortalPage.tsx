'use client';

import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  getBeneficiaryDashboard,
  getPendingBeneficiaries,
  resendInvitation,
  declareDeath,
} from '@/lib/api';
import {
  DeathDeclarationPanel,
  KeepsakeCard,
  TrustedPersonPanel,
} from '@/components/features/beneficiary';
import { Heart, Loader2, Clock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BeneficiaryPortalPage() {
  const t = useTranslations('beneficiary.portal');
  const tAccess = useTranslations('beneficiary.access');
  const tErrors = useTranslations('beneficiary.errors');
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['beneficiary-dashboard'],
    queryFn: getBeneficiaryDashboard,
  });

  const { data: pendingBeneficiaries, refetch: refetchPending } = useQuery({
    queryKey: ['pending-beneficiaries', data?.profile.linkedVaults[0]?.vaultId],
    queryFn: () =>
      data?.profile.linkedVaults[0]?.vaultId
        ? getPendingBeneficiaries(data.profile.linkedVaults[0].vaultId)
        : Promise.resolve([]),
    enabled: !!data?.accessInfo?.canManageInvitations && !!data?.profile.linkedVaults[0]?.vaultId,
  });

  async function handleResendInvitation(beneficiaryId: string): Promise<void> {
    await resendInvitation(beneficiaryId);
    await refetchPending();
  }

  async function handleDeclareDeath(vaultId: string): Promise<void> {
    await declareDeath(vaultId);
    await queryClient.invalidateQueries({ queryKey: ['beneficiary-dashboard'] });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gold-heritage animate-spin mx-auto mb-4" />
          <p className="text-slate">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{tErrors('loadFailed')}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-navy-light hover:text-gold-heritage"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const keepsakes = data?.keepsakes || [];
  const isEmpty = keepsakes.length === 0;
  const isTemporaryAccess = data?.accessInfo?.isTemporaryAccess ?? false;
  const canDeclareDeath = data?.accessInfo?.canDeclareDeath ?? false;
  const canManageInvitations = data?.accessInfo?.canManageInvitations ?? false;

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        {/* Temporary Access Banner */}
        {isTemporaryAccess && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start md:items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 md:mt-0" />
                <div>
                  <p className="font-medium text-amber-900">{tAccess('temporaryBanner.title')}</p>
                  <p className="text-sm text-amber-700">{tAccess('temporaryBanner.description')}</p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/portal/register')}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {tAccess('temporaryBanner.createAccount')}
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="font-serif-brand text-display-sm md:text-display text-navy-deep mb-4">
            {t('title')}
          </h1>
          {!isEmpty && (
            <p className="text-slate">{t('stats.totalKeepsakes', { count: keepsakes.length })}</p>
          )}
        </div>

        {/* Death Declaration Panel - shown for trusted persons with permission */}
        {canDeclareDeath && data?.profile.linkedVaults && (
          <DeathDeclarationPanel
            linkedVaults={data.profile.linkedVaults}
            onDeclareDeath={handleDeclareDeath}
          />
        )}

        {/* Trusted Person Panel - for managing invitations */}
        {canManageInvitations && pendingBeneficiaries && pendingBeneficiaries.length > 0 && (
          <TrustedPersonPanel
            beneficiaries={pendingBeneficiaries.map((b) => ({
              id: b.id,
              name: b.name,
              email: b.email,
              invitationStatus: b.invitationStatus,
              invitationSentAt: new Date(b.invitationSentAt),
            }))}
            onResendInvitation={handleResendInvitation}
          />
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="bg-warm-gray rounded-2xl p-12 md:p-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gold-heritage/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 md:w-10 md:h-10 text-gold-heritage" />
            </div>
            <h2 className="font-serif-brand text-xl md:text-2xl text-navy-deep mb-3">
              {t('empty.title')}
            </h2>
            <p className="text-slate max-w-md mx-auto">{t('empty.message')}</p>
          </div>
        )}

        {/* Keepsakes grid */}
        {!isEmpty && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {keepsakes.map((keepsake) => (
              <KeepsakeCard
                key={keepsake.id}
                id={keepsake.id}
                type={keepsake.type}
                title={keepsake.title}
                senderName={keepsake.senderName}
                deliveredAt={new Date(keepsake.deliveredAt)}
                hasPersonalMessage={keepsake.hasPersonalMessage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
