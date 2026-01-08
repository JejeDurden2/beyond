'use client';

import { useTranslations } from 'next-intl';
import { OnboardingProgress } from './OnboardingProgress';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="w-full max-w-md mx-auto text-center animate-[fadeIn_0.8s_ease-out]">
      <OnboardingProgress currentStep={0} totalSteps={4} />

      <div className="mt-16 mb-12">
        <h1 className="font-serif-brand text-3xl md:text-4xl text-navy-deep mb-6">
          {t('welcome.title')}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{t('welcome.subtitle')}</p>
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
