'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Mail, Camera, Video, FileText, Gift, Check } from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';

type IntentionType = 'letters' | 'photos' | 'videos' | 'wishes' | 'gifts';

const INTENTION_ICONS: Record<IntentionType, React.ReactNode> = {
  letters: <Mail className="w-5 h-5" />,
  photos: <Camera className="w-5 h-5" />,
  videos: <Video className="w-5 h-5" />,
  wishes: <FileText className="w-5 h-5" />,
  gifts: <Gift className="w-5 h-5" />,
};

interface IntentionStepProps {
  initialData?: IntentionType[];
  onBack: () => void;
  onNext: (intentions: IntentionType[]) => void;
  onSkip: () => void;
}

export function IntentionStep({ initialData, onBack, onNext, onSkip }: IntentionStepProps) {
  const t = useTranslations('onboarding');
  const [selectedIntentions, setSelectedIntentions] = useState<IntentionType[]>(initialData || []);

  const toggleIntention = useCallback((intention: IntentionType) => {
    setSelectedIntentions((prev) =>
      prev.includes(intention) ? prev.filter((i) => i !== intention) : [...prev, intention],
    );
  }, []);

  const handleSubmit = useCallback(() => {
    onNext(selectedIntentions);
  }, [selectedIntentions, onNext]);

  const intentions: IntentionType[] = ['letters', 'photos', 'videos', 'wishes', 'gifts'];

  return (
    <div className="w-full max-w-md mx-auto animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('back')}
        </button>
        <span className="text-sm text-muted-foreground">{t('step', { current: 2, total: 3 })}</span>
      </div>

      <OnboardingProgress currentStep={2} totalSteps={4} />

      <h1 className="font-serif-brand text-2xl md:text-3xl text-navy-deep mt-8 mb-2 text-center">
        {t('intention.title')}
      </h1>
      <p className="text-muted-foreground text-center mb-8">{t('intention.subtitle')}</p>

      {/* Intention cards */}
      <div className="space-y-3 mb-8">
        {intentions.map((intention) => {
          const isSelected = selectedIntentions.includes(intention);
          return (
            <button
              key={intention}
              onClick={() => toggleIntention(intention)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-gold-heritage bg-gold-soft/20'
                  : 'border-border hover:border-gold-heritage/50 bg-background'
              }`}
            >
              <div
                className={`flex-shrink-0 ${isSelected ? 'text-gold-heritage' : 'text-muted-foreground'}`}
              >
                {INTENTION_ICONS[intention]}
              </div>
              <span className={`flex-1 ${isSelected ? 'text-navy-deep' : 'text-foreground'}`}>
                {t(`intention.options.${intention}`)}
              </span>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-gold-heritage flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onSkip}
          className="flex-1 px-6 py-4 text-muted-foreground hover:text-foreground rounded-2xl border border-border hover:border-border/80 transition-all duration-200"
        >
          {t('intention.skip')}
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-6 py-4 bg-navy-deep text-white rounded-2xl font-medium transition-all duration-300 hover:bg-navy-deep/90 hover:shadow-soft-lg"
        >
          {t('continue')}
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
      `}</style>
    </div>
  );
}
