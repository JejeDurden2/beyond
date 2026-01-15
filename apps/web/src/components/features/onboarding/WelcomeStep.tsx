'use client';

import { useTranslations } from 'next-intl';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { OnboardingProgress } from './OnboardingProgress';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps): React.ReactElement {
  const t = useTranslations('onboarding');

  return (
    <div className="w-full max-w-md mx-auto text-center animate-[fadeIn_0.8s_ease-out]">
      <div className="flex justify-center">
        <OnboardingProgress currentStep={0} totalSteps={3} />
      </div>

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

      {/* Legal disclaimer - security info is shown in the footer via OnboardingLayout */}
      <div className="mt-8 px-4">
        <div className="flex items-start gap-2 justify-center text-xs text-slate">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <span>{t('welcome.disclaimers.notLegal')}</span>
            <Link
              href="/legal/disclaimer"
              className="inline-flex items-center gap-0.5 ml-1 text-navy-light transition-colors hover:text-gold-heritage"
            >
              {t('welcome.disclaimers.learnMore')}
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

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
