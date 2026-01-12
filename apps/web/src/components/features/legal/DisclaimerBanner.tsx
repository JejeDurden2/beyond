import { useTranslations } from 'next-intl';
import { ShieldCheck, Lock, Users } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function DisclaimerBanner(): React.ReactElement {
  const t = useTranslations('landing.disclaimer');

  const items = [
    {
      icon: ShieldCheck,
      titleKey: 'items.notLegal.title' as const,
      descKey: 'items.notLegal.description' as const,
    },
    {
      icon: Lock,
      titleKey: 'items.privacy.title' as const,
      descKey: 'items.privacy.description' as const,
    },
    {
      icon: Users,
      titleKey: 'items.overseer.title' as const,
      descKey: 'items.overseer.description' as const,
    },
  ];

  return (
    <section className="bg-warm-gray px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-4 text-center font-serif-brand text-display-sm text-navy-deep">
          {t('title')}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-slate">{t('subtitle')}</p>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {items.map(({ icon: Icon, titleKey, descKey }) => (
            <div key={titleKey} className="rounded-2xl bg-cream p-6 shadow-soft">
              <Icon className="mb-4 h-8 w-8 text-gold-heritage" />
              <h3 className="mb-2 font-medium text-navy-deep">{t(titleKey)}</h3>
              <p className="text-sm text-slate">{t(descKey)}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href={t('ctaLink')}
            className="text-sm font-medium text-navy-light transition-colors hover:text-gold-heritage"
          >
            {t('cta')} →
          </Link>
        </div>
      </div>
    </section>
  );
}
