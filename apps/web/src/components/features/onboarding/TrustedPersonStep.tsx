'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Shield,
  MessageCircle,
  UserCheck,
  Scale,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';
import { RELATIONSHIPS, type Relationship } from '@/types';

interface TrustedPersonData {
  firstName: string;
  lastName: string;
  email: string;
  relationship: Relationship;
}

interface TrustedPersonStepProps {
  onBack: () => void;
  onNext: (trustedPerson: TrustedPersonData) => void;
  onSkip: () => void;
}

interface EducationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const INPUT_CLASS =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200';

function EducationCard({ icon: Icon, title, description }: EducationCardProps): React.ReactElement {
  return (
    <div className="p-5 rounded-2xl border border-border bg-warm-gray/30">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold-heritage/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-gold-heritage" />
        </div>
        <div>
          <h3 className="font-medium text-navy-deep mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function TrustedPersonStep({
  onBack,
  onNext,
  onSkip,
}: TrustedPersonStepProps): React.ReactElement {
  const t = useTranslations('onboarding');
  const tBeneficiaries = useTranslations('beneficiaries');

  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('SPOUSE');

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();

    if (trimmedFirst && trimmedLast && trimmedEmail) {
      onNext({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
        relationship,
      });
    }
  }

  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    email.includes('@');

  if (showForm) {
    return (
      <div className="w-full max-w-md mx-auto animate-[fadeIn_0.5s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setShowForm(false)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('back')}
          </button>
          <span className="text-sm text-muted-foreground">
            {t('step', { current: 2, total: 2 })}
          </span>
        </div>

        <OnboardingProgress currentStep={2} totalSteps={3} />

        <h1 className="font-serif-brand text-2xl md:text-3xl text-navy-deep mt-8 mb-2 text-center">
          {t('trustedPerson.form.title')}
        </h1>
        <p className="text-muted-foreground text-center mb-8">{t('trustedPerson.form.subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={INPUT_CLASS}
            placeholder={tBeneficiaries('form.firstName')}
          />

          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={INPUT_CLASS}
            placeholder={tBeneficiaries('form.lastName')}
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT_CLASS}
            placeholder={tBeneficiaries('form.email')}
          />

          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value as Relationship)}
            className={INPUT_CLASS}
          >
            {RELATIONSHIPS.map((rel) => (
              <option key={rel} value={rel}>
                {tBeneficiaries(`relationships.${rel}`)}
              </option>
            ))}
          </select>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 px-6 py-4 text-muted-foreground hover:text-foreground rounded-2xl border border-border hover:border-border/80 transition-all duration-200"
            >
              {t('trustedPerson.later')}
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 px-6 py-4 bg-navy-deep text-white rounded-2xl font-medium transition-all duration-300 hover:bg-navy-deep/90 hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('trustedPerson.addAndFinish')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const educationCards = [
    { icon: Shield, key: 'role' },
    { icon: MessageCircle, key: 'talk' },
    { icon: UserCheck, key: 'choose' },
    { icon: Scale, key: 'notary' },
  ] as const;

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
        <span className="text-sm text-muted-foreground">{t('step', { current: 2, total: 2 })}</span>
      </div>

      <OnboardingProgress currentStep={2} totalSteps={3} />

      <h1 className="font-serif-brand text-2xl md:text-3xl text-navy-deep mt-8 mb-2 text-center">
        {t('trustedPerson.title')}
      </h1>
      <p className="text-muted-foreground text-center mb-8">{t('trustedPerson.subtitle')}</p>

      {/* Education cards */}
      <div className="space-y-4 mb-8">
        {educationCards.map(({ icon, key }) => (
          <EducationCard
            key={key}
            icon={icon}
            title={t(`trustedPerson.points.${key}.title`)}
            description={t(`trustedPerson.points.${key}.description`)}
          />
        ))}
      </div>

      {/* CTA to add trusted person */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-gold-heritage bg-gold-soft/10 hover:bg-gold-soft/20 transition-all duration-200 mb-4"
      >
        <div className="text-left">
          <span className="block font-medium text-navy-deep">{t('trustedPerson.cta.title')}</span>
          <span className="block text-sm text-muted-foreground">
            {t('trustedPerson.cta.subtitle')}
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-gold-heritage" />
      </button>

      {/* Skip option */}
      <button
        onClick={onSkip}
        className="w-full px-6 py-4 text-muted-foreground hover:text-foreground rounded-2xl border border-border hover:border-border/80 transition-all duration-200"
      >
        {t('trustedPerson.skipForNow')}
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
