import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata, getBaseUrl } from '@/lib/seo';
import { JsonLd } from '@/components/seo';
import { HomePage } from '@/components/features/home';
import type { Locale } from '../../../i18n.config';

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo.home' });

  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    path: '',
  });
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const baseUrl = getBaseUrl();

  const organizationJsonLd = {
    '@context': 'https://schema.org' as const,
    '@type': 'Organization',
    name: 'Beyond',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      locale === 'fr'
        ? "Plateforme d'héritage numérique sécurisée"
        : 'Secure digital legacy platform',
    sameAs: [],
  };

  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <HomePage />
    </>
  );
}
