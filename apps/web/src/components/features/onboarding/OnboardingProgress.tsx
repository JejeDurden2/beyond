'use client';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i < currentStep ? 'bg-gold-heritage' : i === currentStep ? 'bg-navy-deep' : 'bg-border'
          }`}
        />
      ))}
    </div>
  );
}
