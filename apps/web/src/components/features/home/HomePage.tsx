'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/layout';
import { Logo, Lock, Globe, ShieldCheck } from '@/components/ui';
import { Mail, Camera, Star } from 'lucide-react';

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const t = useTranslations('landing');

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-24">
          <div className="max-w-3xl text-center space-y-8 animate-fade-in">
            <h1 className="font-serif-brand text-display-lg text-navy-deep text-balance">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-slate leading-relaxed max-w-2xl mx-auto text-balance">
              {t('hero.subtitle')}
            </p>
            <div className="pt-6">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="bg-gold-heritage text-cream hover:bg-gold-soft rounded-xl px-8 py-4 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md inline-block"
                >
                  {t('hero.ctaAuth')}
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="bg-gold-heritage text-cream hover:bg-gold-soft rounded-xl px-8 py-4 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md inline-block"
                >
                  {t('hero.ctaGuest')}
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 px-6 border-y border-warm-gray">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <TrustIndicator
                icon={<Lock className="w-6 h-6" strokeWidth={1.5} />}
                title={t('trust.secure.title')}
                description={t('trust.secure.description')}
              />
              <TrustIndicator
                icon={<Globe className="w-6 h-6" strokeWidth={1.5} />}
                title={t('trust.private.title')}
                description={t('trust.private.description')}
              />
              <TrustIndicator
                icon={<ShieldCheck className="w-6 h-6" strokeWidth={1.5} />}
                title={t('trust.trusted.title')}
                description={t('trust.trusted.description')}
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-6 bg-warm-gray">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-slate mb-12">{t('howItWorks.intro')}</p>
            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                number="1"
                title={t('howItWorks.step1.title')}
                description={t('howItWorks.step1.description')}
              />
              <StepCard
                number="2"
                title={t('howItWorks.step2.title')}
                description={t('howItWorks.step2.description')}
              />
              <StepCard
                number="3"
                title={t('howItWorks.step3.title')}
                description={t('howItWorks.step3.description')}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-cream">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif-brand text-display-sm text-navy-deep text-center mb-16">
              {t('features.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Mail className="w-8 h-8" />}
                title={t('features.letters.title')}
                description={t('features.letters.description')}
              />
              <FeatureCard
                icon={<Camera className="w-8 h-8" />}
                title={t('features.photos.title')}
                description={t('features.photos.description')}
              />
              <FeatureCard
                icon={<Star className="w-8 h-8" />}
                title={t('features.wishes.title')}
                description={t('features.wishes.description')}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-warm-gray">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="font-serif-brand text-display-sm text-navy-deep">{t('cta.title')}</h2>
            <p className="text-lg text-slate">{t('cta.description')}</p>
            {!isAuthenticated && (
              <Link
                href="/register"
                className="bg-gold-heritage text-cream hover:bg-gold-soft rounded-xl px-8 py-4 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md inline-block"
              >
                {t('hero.ctaGuest')}
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-warm-gray bg-cream">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate">
          <Logo variant="text" className="h-6" />
          <span>{t('footer.tagline')}</span>
        </div>
      </footer>
    </div>
  );
}

function TrustIndicator({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center space-y-3">
      <div className="w-12 h-12 mx-auto bg-warm-gray rounded-xl flex items-center justify-center text-navy-light">
        {icon}
      </div>
      <h3 className="font-medium text-navy-deep">{title}</h3>
      <p className="text-sm text-slate">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center space-y-4">
      <div className="w-10 h-10 mx-auto bg-gold-heritage text-cream rounded-full flex items-center justify-center font-serif-brand text-lg">
        {number}
      </div>
      <h3 className="font-serif-brand text-lg text-navy-deep">{title}</h3>
      <p className="text-slate text-sm">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-warm-gray rounded-2xl border border-border/50 shadow-soft p-8 transition-shadow duration-200 ease-out hover:shadow-soft-md">
      <div className="text-navy-light mb-4">{icon}</div>
      <h3 className="font-serif-brand text-xl text-navy-deep mb-3">{title}</h3>
      <p className="text-slate leading-relaxed">{description}</p>
    </div>
  );
}
