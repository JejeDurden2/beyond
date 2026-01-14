'use client';

import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';

interface BeneficiaryWelcomeStepProps {
  onNext: () => void;
}

export function BeneficiaryWelcomeStep({
  onNext,
}: BeneficiaryWelcomeStepProps): React.ReactElement {
  const t = useTranslations('onboarding.beneficiaryOnboarding');

  return (
    <div className="w-full max-w-md mx-auto text-center animate-[fadeIn_0.8s_ease-out]">
      <OnboardingProgress currentStep={0} totalSteps={3} />

      {/* Icon */}
      <div className="mt-12 mb-8 flex justify-center">
        <div className="w-20 h-20 rounded-full bg-gold-heritage/10 flex items-center justify-center">
          <Heart className="w-10 h-10 text-gold-heritage" />
        </div>
      </div>

      <div className="mb-12">
        <h1 className="font-serif-brand text-3xl md:text-4xl text-navy-deep mb-4">
          {t('welcome.title')}
        </h1>
        <p className="text-lg text-gold-heritage font-medium mb-4">{t('welcome.subtitle')}</p>
        <p className="text-muted-foreground leading-relaxed">{t('welcome.description')}</p>
      </div>

      <button
        onClick={onNext}
        className="w-full max-w-xs mx-auto px-8 py-4 bg-navy-deep text-white rounded-2xl font-medium transition-all duration-300 hover:bg-navy-deep/90 hover:shadow-soft-lg"
      >
        {t('welcome.cta')}
      </button>

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
