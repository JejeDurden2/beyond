'use client';

import { useTranslations } from 'next-intl';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { BentoCard } from './BentoCard';

export function WelcomeCard(): React.ReactElement {
  const t = useTranslations('dashboard.grid.welcome');
  const { user } = useAuth();

  return (
    <BentoCard className="lg:col-span-2">
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-navy-deep">
            {t('greeting', { name: user?.firstName || '' })}
          </h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 text-gold-heritage" />
          <span>{t('security')}</span>
        </div>
      </div>
    </BentoCard>
  );
}
