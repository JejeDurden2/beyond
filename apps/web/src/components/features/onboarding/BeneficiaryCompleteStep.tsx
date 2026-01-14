'use client';

import { useTranslations } from 'next-intl';
import { Check, Heart } from 'lucide-react';

interface BeneficiaryCompleteStepProps {
  onViewPortal: () => void;
}

export function BeneficiaryCompleteStep({
  onViewPortal,
}: BeneficiaryCompleteStepProps): React.ReactElement {
  const t = useTranslations('onboarding.beneficiaryOnboarding');

  return (
    <div className="w-full max-w-md mx-auto text-center animate-[fadeIn_0.8s_ease-out]">
      {/* Success checkmark */}
      <div className="mb-8 flex justify-center animate-[scaleIn_0.5s_ease-out_0.3s_both]">
        <div className="w-20 h-20 rounded-full bg-gold-heritage/10 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gold-heritage flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <h1 className="font-serif-brand text-2xl md:text-3xl text-navy-deep mb-4 animate-[fadeIn_0.5s_ease-out_0.5s_both]">
        {t('complete.title')}
      </h1>
      <p className="text-lg text-gold-heritage font-medium mb-2 animate-[fadeIn_0.5s_ease-out_0.6s_both]">
        {t('complete.subtitle')}
      </p>
      <p className="text-muted-foreground mb-12 animate-[fadeIn_0.5s_ease-out_0.7s_both]">
        {t('complete.description')}
      </p>

      <div className="animate-[fadeIn_0.5s_ease-out_0.9s_both]">
        <button
          onClick={onViewPortal}
          className="w-full px-8 py-4 bg-navy-deep text-white rounded-2xl font-medium transition-all duration-300 hover:bg-navy-deep/90 hover:shadow-soft-lg flex items-center justify-center gap-3"
        >
          <Heart className="w-5 h-5" />
          {t('complete.cta')}
        </button>
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

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
