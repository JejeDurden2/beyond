'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAccessInfo, createTemporaryAccess } from '@/lib/api/beneficiary-access';
import { Heart, Loader2, User, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeneficiaryAccessPageProps {
  token: string;
  locale: string;
}

export function BeneficiaryAccessPage({ token, locale }: BeneficiaryAccessPageProps) {
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
      // Store the temporary access token in session storage
      sessionStorage.setItem('beneficiary_temp_token', response.accessToken);
      sessionStorage.setItem('beneficiary_temp_expires', response.expiresAt);
      // Navigate to the portal
      router.push(`/${locale}/portal`);
    },
  });

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

  if (error || !data) {
    const errorMessage = error instanceof Error ? error.message : t('errors.invalidLink');
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-xl shadow-legacy p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="font-serif-brand text-h3 text-navy-deep mb-4">{t('errors.title')}</h1>
          <p className="text-slate mb-6">{errorMessage}</p>
          <Button variant="outline" onClick={() => router.push(`/${locale}`)}>
            {t('errors.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  const keepsakeText =
    data.keepsakeCount === 1
      ? t('keepsakes.singular')
      : t('keepsakes.plural', { count: data.keepsakeCount });

  const handleCreateAccount = () => {
    setIsCreatingAccount(true);
    // Navigate to account creation page with the token
    router.push(`/${locale}/beneficiary/accept-invitation/${token}`);
  };

  const handleJustView = () => {
    temporaryAccessMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-legacy p-8 md:p-10">
        {/* Header with Heart Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gold-heritage/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-gold-heritage" />
          </div>
          <h1 className="font-serif-brand text-h2 text-navy-deep mb-3">
            {t('title', { name: data.vaultOwnerName })}
          </h1>
          <p className="text-slate text-lg">{t('subtitle', { keepsakes: keepsakeText })}</p>
        </div>

        {/* Beneficiary Info */}
        <div className="bg-cream/50 rounded-lg p-4 mb-8">
          <p className="text-sm text-slate mb-1">{t('receivingAs')}</p>
          <p className="font-medium text-navy-deep">{data.beneficiaryName}</p>
          <p className="text-sm text-slate">{data.beneficiaryEmail}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Create Account - always available */}
          <Button
            onClick={handleCreateAccount}
            disabled={isCreatingAccount}
            className="w-full py-6 text-lg"
            size="lg"
          >
            <User className="w-5 h-5 mr-2" />
            {isCreatingAccount ? t('buttons.creatingAccount') : t('buttons.createAccount')}
          </Button>

          {/* Just View - only for non-trusted persons */}
          {!data.isTrustedPerson && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-slate">{t('or')}</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleJustView}
                disabled={temporaryAccessMutation.isPending}
                className="w-full py-6 text-lg"
                size="lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                {temporaryAccessMutation.isPending ? t('buttons.loading') : t('buttons.justView')}
              </Button>

              <p className="text-center text-sm text-slate">{t('viewDisclaimer')}</p>
            </>
          )}

          {/* Trusted person notice */}
          {data.isTrustedPerson && (
            <div className="bg-gold-heritage/10 rounded-lg p-4 mt-4">
              <p className="text-sm text-navy-deep">
                <strong>{t('trustedPerson.title')}</strong>
              </p>
              <p className="text-sm text-slate mt-1">{t('trustedPerson.description')}</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {temporaryAccessMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">
              {temporaryAccessMutation.error instanceof Error
                ? temporaryAccessMutation.error.message
                : t('errors.generic')}
            </p>
          </div>
        )}

        {/* Login Link */}
        {data.hasAccount && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate">
              {t('hasAccount')}{' '}
              <button
                onClick={() => router.push(`/${locale}/beneficiary/login`)}
                className="text-gold-heritage hover:text-gold-heritage/80 font-medium"
              >
                {t('buttons.login')}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
