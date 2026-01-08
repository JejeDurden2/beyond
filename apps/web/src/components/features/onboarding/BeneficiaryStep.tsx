'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';
import { RELATIONSHIPS, type Relationship } from '@/types';

interface BeneficiaryData {
  firstName: string;
  lastName: string;
  email: string;
  relationship: Relationship;
}

interface BeneficiaryStepProps {
  onBack: () => void;
  onNext: (beneficiary: BeneficiaryData) => void;
  onSkip: () => void;
}

export function BeneficiaryStep({ onBack, onNext, onSkip }: BeneficiaryStepProps) {
  const t = useTranslations('onboarding');
  const tBeneficiaries = useTranslations('beneficiaries');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('SPOUSE');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (firstName.trim() && lastName.trim() && email.trim()) {
        onNext({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          relationship,
        });
      }
    },
    [firstName, lastName, email, relationship, onNext],
  );

  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    email.includes('@');

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
        <span className="text-sm text-muted-foreground">{t('step', { current: 3, total: 3 })}</span>
      </div>

      <OnboardingProgress currentStep={3} totalSteps={4} />

      <h1 className="font-serif-brand text-2xl md:text-3xl text-navy-deep mt-8 mb-2 text-center">
        {t('beneficiary.title')}
      </h1>
      <p className="text-muted-foreground text-center mb-8">{t('beneficiary.subtitle')}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First name */}
        <div>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
            placeholder={tBeneficiaries('form.firstName')}
          />
        </div>

        {/* Last name */}
        <div>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
            placeholder={tBeneficiaries('form.lastName')}
          />
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
            placeholder={tBeneficiaries('form.email')}
          />
        </div>

        {/* Relationship */}
        <div>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value as Relationship)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
          >
            {RELATIONSHIPS.map((rel) => (
              <option key={rel} value={rel}>
                {tBeneficiaries(`relationships.${rel}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 px-6 py-4 text-muted-foreground hover:text-foreground rounded-2xl border border-border hover:border-border/80 transition-all duration-200"
          >
            {t('beneficiary.later')}
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="flex-1 px-6 py-4 bg-navy-deep text-white rounded-2xl font-medium transition-all duration-300 hover:bg-navy-deep/90 hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('beneficiary.addAndFinish')}
          </button>
        </div>
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
