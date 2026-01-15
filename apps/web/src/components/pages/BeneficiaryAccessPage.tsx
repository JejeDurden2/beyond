'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAccessInfo, createTemporaryAccess } from '@/lib/api/beneficiary-access';
import { Loader2, User, Eye, Lock, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DecorativeSeal, KeepsakeTypeIcon } from '@/components/ui';
import type { KeepsakeType } from '@/types';

interface BeneficiaryAccessPageProps {
  token: string;
  locale: string;
}

export function BeneficiaryAccessPage({
  token,
  locale,
}: BeneficiaryAccessPageProps): React.ReactElement {
  const t = useTranslations('beneficiary.access');
  const router = useRouter();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['access-info', token],
    queryFn: () => getAccessInfo(token),
    retry: false,
  });

  const temporaryAccessMutation = useMutation({
    mutationFn: () => createTemporaryAccess(token),
    onSuccess: (response) => {
      sessionStorage.setItem('beneficiary_temp_token', response.accessToken);
      sessionStorage.setItem('beneficiary_temp_expires', response.expiresAt);
      router.push(`/${locale}/portal`);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-warm-gray flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gold-heritage animate-spin mx-auto mb-4" />
          <p className="text-slate">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const errorMessage = error instanceof Error ? error.message : t('errors.invalidLink');
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-warm-gray flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-soft-lg p-8 md:p-10">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="font-serif-brand text-2xl text-navy-deep mb-4">{t('errors.title')}</h1>
          <p className="text-slate mb-6">{errorMessage}</p>
          <Button variant="outline" onClick={() => router.push(`/${locale}`)}>
            {t('errors.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateAccount = () => {
    setIsCreatingAccount(true);
    router.push(`/${locale}/beneficiary/accept-invitation/${token}`);
  };

  const handleJustView = () => {
    temporaryAccessMutation.mutate();
  };

  const allKeepsakeTypes: KeepsakeType[] = ['letter', 'photo', 'document'];
  const previewTypes = allKeepsakeTypes.slice(0, data.keepsakeCount);
  const moreCount = Math.max(0, data.keepsakeCount - 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-warm-gray flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-gold-heritage/5 to-gold-soft/10 px-8 py-10 text-center">
            <DecorativeSeal className="w-24 h-24 text-gold-heritage mx-auto mb-6" />
            <h1 className="font-serif-brand text-2xl md:text-3xl text-navy-deep mb-3 leading-tight">
              {t('title', { name: data.vaultOwnerName })}
            </h1>
            <p className="text-slate text-lg">{t('subtitle')}</p>
          </div>

          {/* Keepsake Preview Section */}
          <div className="px-8 py-6 border-b border-border/30">
            <div className="flex items-center justify-center gap-3">
              {previewTypes.map((type, index) => (
                <div
                  key={index}
                  className="w-14 h-14 bg-warm-gray rounded-xl flex items-center justify-center"
                >
                  <KeepsakeTypeIcon type={type} className="w-7 h-7 text-navy-light" />
                </div>
              ))}
              {moreCount > 0 ? (
                <div className="w-14 h-14 bg-gold-heritage/10 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-medium text-gold-heritage">
                    {t('keepsakes.more', { count: moreCount })}
                  </span>
                </div>
              ) : null}
            </div>
            <p className="text-center text-sm text-slate mt-3">
              {data.keepsakeCount === 1
                ? t('keepsakes.singular')
                : t('keepsakes.plural', { count: data.keepsakeCount })}
            </p>
          </div>

          {/* Beneficiary Info */}
          <div className="px-8 py-4 bg-cream/30">
            <p className="text-xs text-slate uppercase tracking-wide mb-1">{t('receivingAs')}</p>
            <p className="font-medium text-navy-deep">{data.beneficiaryName}</p>
          </div>

          {/* Trusted Person Notice - shown before options */}
          {data.isTrustedPerson && (
            <div className="mx-8 mt-6 p-4 bg-gold-heritage/10 border border-gold-heritage/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gold-heritage flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy-deep">
                    {t('trustedPerson.title', { name: data.vaultOwnerName })}
                  </p>
                  <p className="text-sm text-slate mt-1">{t('trustedPerson.description')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Options Section */}
          <div className="p-8 space-y-4">
            {/* Option 1: Create Account (Recommended) */}
            <div className="relative border-2 border-gold-heritage/30 rounded-xl p-5 bg-gold-heritage/5 transition-all duration-200 hover:border-gold-heritage/50">
              <span className="absolute -top-3 left-4 bg-gold-heritage text-cream text-xs font-medium px-2 py-0.5 rounded-full">
                {t('options.account.recommended')}
              </span>
              <h3 className="font-medium text-navy-deep mb-3">{t('options.account.title')}</h3>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm text-slate">
                  <Check className="w-4 h-4 text-gold-heritage flex-shrink-0" />
                  {t('options.account.benefits.permanent')}
                </li>
                <li className="flex items-center gap-2 text-sm text-slate">
                  <Check className="w-4 h-4 text-gold-heritage flex-shrink-0" />
                  {t('options.account.benefits.notifications')}
                </li>
                <li className="flex items-center gap-2 text-sm text-slate">
                  <Check className="w-4 h-4 text-gold-heritage flex-shrink-0" />
                  {t('options.account.benefits.multiDevice')}
                </li>
              </ul>
              <Button
                onClick={handleCreateAccount}
                disabled={isCreatingAccount}
                className="w-full bg-gold-heritage hover:bg-gold-soft text-cream"
                size="lg"
              >
                <User className="w-4 h-4 mr-2" />
                {isCreatingAccount ? t('options.account.loading') : t('options.account.button')}
              </Button>
            </div>

            {/* Option 2: Temporary View - only for non-trusted persons */}
            {!data.isTrustedPerson && (
              <div className="border border-border/50 rounded-xl p-5 transition-all duration-200 hover:border-border">
                <h3 className="font-medium text-navy-deep mb-2">{t('options.temporary.title')}</h3>
                <p className="text-sm text-slate mb-4">{t('options.temporary.description')}</p>
                <Button
                  variant="outline"
                  onClick={handleJustView}
                  disabled={temporaryAccessMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {temporaryAccessMutation.isPending
                    ? t('options.temporary.loading')
                    : t('options.temporary.button')}
                </Button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {temporaryAccessMutation.isError && (
            <div className="mx-8 mb-6 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">
                {temporaryAccessMutation.error instanceof Error
                  ? temporaryAccessMutation.error.message
                  : t('errors.generic')}
              </p>
            </div>
          )}

          {/* Login Link */}
          {data.hasAccount && (
            <div className="px-8 pb-8 text-center">
              <p className="text-sm text-slate">
                {t('hasAccount')}{' '}
                <button
                  onClick={() => router.push(`/${locale}/beneficiary/login`)}
                  className="text-gold-heritage hover:text-gold-soft font-medium transition-colors"
                >
                  {t('login')}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
