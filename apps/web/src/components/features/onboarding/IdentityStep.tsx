'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Camera, User } from 'lucide-react';
import { OnboardingProgress } from './OnboardingProgress';

interface IdentityStepProps {
  initialData?: {
    firstName?: string;
    lastName?: string;
    avatarPreview?: string;
  };
  onBack: () => void;
  onNext: (data: { firstName: string; lastName: string; avatarFile?: File }) => void;
}

export function IdentityStep({ initialData, onBack, onNext }: IdentityStepProps) {
  const t = useTranslations('onboarding');
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData?.avatarPreview || null,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (firstName.trim() && lastName.trim()) {
        onNext({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          avatarFile: avatarFile || undefined,
        });
      }
    },
    [firstName, lastName, avatarFile, onNext],
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
          {t('back')}
        </button>
        <span className="text-sm text-muted-foreground">{t('step', { current: 1, total: 3 })}</span>
      </div>

      <OnboardingProgress currentStep={1} totalSteps={4} />

      <h1 className="font-serif-brand text-2xl md:text-3xl text-navy-deep mt-8 mb-2 text-center">
        {t('identity.title')}
      </h1>
      <p className="text-muted-foreground text-center mb-8">{t('identity.subtitle')}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar upload */}
        <div className="flex justify-center mb-8">
          <label className="relative cursor-pointer group">
            <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:border-gold-heritage">
              {avatarPreview ? (
                /* Using img for blob URL preview - Next.js Image doesn't support blob: protocol */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-navy-deep rounded-full flex items-center justify-center text-white shadow-soft">
              <Camera className="w-4 h-4" />
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        {/* First name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('identity.firstName')}
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
            placeholder={t('identity.firstName')}
          />
        </div>

        {/* Last name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('identity.lastName')}
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-200"
            placeholder={t('identity.lastName')}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid}
          className="w-full px-8 py-4 bg-navy-deep text-white rounded-2xl font-medium transition-all duration-300 hover:bg-navy-deep/90 hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('continue')}
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
