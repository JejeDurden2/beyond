import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/seo';
import { LegalLayout, LegalSection } from '@/components/features/legal';
import type { Locale } from '../../../../../i18n.config';

interface DisclaimerPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export async function generateMetadata({ params }: DisclaimerPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo.legal.disclaimer' });

  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    path: '/legal/disclaimer',
  });
}

export default async function DisclaimerPage({
  params,
}: DisclaimerPageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.disclaimer' });

  return (
    <LegalLayout title={t('title')} lastUpdated={t('lastUpdated', { date: '12 janvier 2026' })}>
      <div className="prose prose-slate max-w-none">
        <p className="mb-8 text-lg text-navy-deep">{t('intro')}</p>

        <LegalSection
          title={t('sections.notLegal.title')}
          items={[
            t('sections.notLegal.items.0'),
            t('sections.notLegal.items.1'),
            t('sections.notLegal.items.2'),
            t('sections.notLegal.items.3'),
          ]}
        />

        <LegalSection
          title={t('sections.privacy.title')}
          items={[
            t('sections.privacy.items.0'),
            t('sections.privacy.items.1'),
            t('sections.privacy.items.2'),
            t('sections.privacy.items.3'),
          ]}
        />

        <LegalSection
          title={t('sections.responsibility.title')}
          items={[
            t('sections.responsibility.items.0'),
            t('sections.responsibility.items.1'),
            t('sections.responsibility.items.2'),
            t('sections.responsibility.items.3'),
          ]}
        />

        <LegalSection
          title={t('sections.technical.title')}
          items={[
            t('sections.technical.items.0'),
            t('sections.technical.items.1'),
            t('sections.technical.items.2'),
            t('sections.technical.items.3'),
          ]}
        />

        <LegalSection
          title={t('sections.overseer.title')}
          items={[
            t('sections.overseer.items.0'),
            t('sections.overseer.items.1'),
            t('sections.overseer.items.2'),
            t('sections.overseer.items.3'),
          ]}
        />
      </div>
    </LegalLayout>
  );
}
