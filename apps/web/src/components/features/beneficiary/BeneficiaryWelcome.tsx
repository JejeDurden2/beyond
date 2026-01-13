'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Lock, Heart } from 'lucide-react';

interface BeneficiaryWelcomeProps {
  senderName: string;
  keepsakeCount: number;
}

export function BeneficiaryWelcome({ senderName, keepsakeCount }: BeneficiaryWelcomeProps) {
  const t = useTranslations('beneficiary.welcome');

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        {/* Main card */}
        <div
          className="bg-warm-gray rounded-2xl p-6 md:p-12 shadow-soft"
          style={{
            boxShadow: `
              0 25px 50px -12px rgba(26, 54, 93, 0.1),
              0 0 0 1px rgba(184, 134, 11, 0.05)
            `,
          }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gold-heritage/10 flex items-center justify-center">
                <Heart className="w-8 h-8 md:w-10 md:h-10 text-gold-heritage" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-cream border-2 border-warm-gray flex items-center justify-center">
                <Lock className="w-3 h-3 md:w-4 md:h-4 text-navy-deep" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif-brand text-display-sm md:text-display text-navy-deep text-center mb-4">
            {t('title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-navy-deep text-center mb-6 md:mb-8">
            {t('subtitle', { senderName })}
          </p>

          {/* Message count */}
          <div className="bg-cream rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <p className="text-base md:text-lg text-slate text-center">
              {keepsakeCount === 1
                ? t('message.single')
                : t('message.multiple', { count: keepsakeCount })}
            </p>
          </div>

          {/* Context info */}
          <div className="space-y-3 mb-8 md:mb-10">
            <div className="flex items-start gap-3 text-sm md:text-base text-slate">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-heritage mt-2 flex-shrink-0" />
              <p>{t('context.fromVault', { senderName })}</p>
            </div>
            <div className="flex items-start gap-3 text-sm md:text-base text-slate">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-heritage mt-2 flex-shrink-0" />
              <p>{t('context.encrypted')}</p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/portal"
            className="block w-full py-3 md:py-4 px-6 bg-gold-heritage text-cream text-center rounded-xl font-medium hover:bg-gold-soft transition-colors duration-300 text-base md:text-lg"
          >
            {t('cta')}
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-slate/70 mt-6">
          <Lock className="inline w-3 h-3 mr-1" />
          {t('context.encrypted')}
        </p>
      </div>
    </div>
  );
}
