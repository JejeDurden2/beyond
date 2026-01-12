import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/seo';
import { LegalLayout, LegalSection } from '@/components/features/legal';
import type { Locale } from '../../../../../i18n.config';

interface PrivacyPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo.legal.privacy' });

  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    path: '/legal/privacy',
  });
}

export default async function PrivacyPage({
  params,
}: PrivacyPageProps): Promise<React.ReactElement> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.privacy' });

  return (
    <LegalLayout title={t('title')} lastUpdated={t('lastUpdated', { date: '12 janvier 2026' })}>
      <LegalSection
        title={t('sections.dataCollection.title')}
        items={[
          t('sections.dataCollection.items.0'),
          t('sections.dataCollection.items.1'),
          t('sections.dataCollection.items.2'),
          t('sections.dataCollection.items.3'),
        ]}
      />

      <LegalSection
        title={t('sections.dataUse.title')}
        items={[
          t('sections.dataUse.items.0'),
          t('sections.dataUse.items.1'),
          t('sections.dataUse.items.2'),
          t('sections.dataUse.items.3'),
        ]}
      />

      <LegalSection
        title={t('sections.encryption.title')}
        items={[
          t('sections.encryption.items.0'),
          t('sections.encryption.items.1'),
          t('sections.encryption.items.2'),
          t('sections.encryption.items.3'),
        ]}
      />

      <LegalSection
        title={t('sections.rights.title')}
        items={[
          t('sections.rights.items.0'),
          t('sections.rights.items.1'),
          t('sections.rights.items.2'),
          t('sections.rights.items.3'),
        ]}
      />

      <LegalSection
        title={t('sections.retention.title')}
        items={[
          t('sections.retention.items.0'),
          t('sections.retention.items.1'),
          t('sections.retention.items.2'),
          t('sections.retention.items.3'),
        ]}
      />

      <LegalSection
        title={t('sections.cookies.title')}
        items={[
          t('sections.cookies.items.0'),
          t('sections.cookies.items.1'),
          t('sections.cookies.items.2'),
        ]}
      />
    </LegalLayout>
  );
}
