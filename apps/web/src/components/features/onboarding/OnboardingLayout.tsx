'use client';

import { Logo } from '@/components/ui';
import { Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  showTrustIndicator?: boolean;
}

export function OnboardingLayout({ children, showTrustIndicator = true }: OnboardingLayoutProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-gray to-background flex flex-col">
      {/* Header with logo */}
      <header className="px-6 py-8">
        <Logo className="h-8" />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        {children}
      </main>

      {/* Trust indicator */}
      {showTrustIndicator && (
        <footer className="fixed bottom-0 left-0 right-0 px-6 py-6 bg-gradient-to-t from-background to-transparent">
          <div className="max-w-md mx-auto flex items-start gap-3 text-sm text-muted-foreground">
            <Shield className="w-5 h-5 text-gold-heritage flex-shrink-0 mt-0.5" />
            <p>{t('welcome.trust')}</p>
          </div>
        </footer>
      )}
    </div>
  );
}
