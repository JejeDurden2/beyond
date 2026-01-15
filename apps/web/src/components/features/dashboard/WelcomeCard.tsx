'use client';

import { useTranslations } from 'next-intl';
import { Shield, Lock, Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/hooks/use-auth';
import { BentoCard } from './BentoCard';

export function WelcomeCard(): React.ReactElement {
  const t = useTranslations('dashboard.grid.welcome');
  const { user } = useAuth();

  return (
    <BentoCard className="lg:col-span-2 relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03]">
        <svg viewBox="0 0 100 100" className="w-full h-full text-navy-deep">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="font-serif-brand text-2xl md:text-3xl text-navy-deep">
            {t('greeting', { name: user?.firstName || '' })}
          </h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">{t('subtitle')}</p>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-7 h-7 rounded-full bg-gold-heritage/10 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-gold-heritage" />
            </div>
            <span>{t('security')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span>{t('encrypted')}</span>
          </div>
        </div>

        {/* Primary CTA */}
        <Link
          href="/keepsakes/new"
          className="inline-flex items-center gap-2 bg-gold-heritage text-cream hover:bg-gold-soft px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-soft hover:shadow-soft-md"
        >
          <Plus className="w-4 h-4" />
          {t('cta')}
        </Link>
      </div>
    </BentoCard>
  );
}
