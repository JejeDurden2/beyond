'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';

interface BeneficiaryProfileStepProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
  };
  onBack: () => void;
  onNext: (data: { firstName: string; lastName: string }) => void;
}

export function BeneficiaryProfileStep({
  initialData,
  onBack,
  onNext,
}: BeneficiaryProfileStepProps): React.ReactElement {
  const t = useTranslations('onboarding.beneficiaryOnboarding');
  const tCommon = useTranslations('onboarding');
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (firstName.trim() && lastName.trim()) {
        onNext({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
      }
    },
    [firstName, lastName, onNext],
  );

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <div className="w-full max-w-md mx-auto animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {tCommon('back')}
        </button>
        <span className="text-sm text-muted-foreground">
          {tCommon('step', { current: 2, total: 3 })}
        </span>
      </div>

      <OnboardingProgress currentStep={1} totalSteps={3} />

      <h1 className="font-serif-brand text-2xl md:text-3xl text-navy-deep mt-8 mb-2 text-center">
        {t('profile.title')}
      </h1>
      <p className="text-muted-foreground text-center mb-8">{t('profile.subtitle')}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('profile.firstName')}
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
            placeholder={t('profile.firstName')}
          />
        </div>

        {/* Last name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('profile.lastName')}
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
            placeholder={t('profile.lastName')}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid}
          className="w-full px-8 py-4 bg-navy-deep text-white rounded-2xl font-medium transition-all duration-300 hover:bg-navy-deep/90 hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {tCommon('continue')}
        </button>
      </form>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
