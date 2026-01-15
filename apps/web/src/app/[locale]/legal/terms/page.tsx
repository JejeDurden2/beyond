import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/seo';
import { LegalLayout, LegalSection } from '@/components/features/legal';
import type { Locale } from '../../../../../i18n.config';

interface TermsPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo.legal.terms' });

  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    path: '/legal/terms',
  });
}

export default async function TermsPage({ params }: TermsPageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.terms' });

  return (
    <LegalLayout title={t('title')} lastUpdated={t('lastUpdated', { date: '15 janvier 2026' })}>
      <LegalSection title={t('sections.service.title')} content={t('sections.service.content')} />

      <LegalSection title={t('sections.account.title')} content={t('sections.account.content')} />

      <LegalSection title={t('sections.content.title')} content={t('sections.content.content')} />

      <LegalSection
        title={t('sections.liability.title')}
        content={t('sections.liability.content')}
      />

      <LegalSection
        title={t('sections.termination.title')}
        content={t('sections.termination.content')}
      />
    </LegalLayout>
  );
}
