import type { Metadata } from 'next';
import type { Locale } from '../../../i18n.config';

interface PageMetadataInput {
  title: string;
  description: string;
  locale: Locale;
  path: string;
  noIndex?: boolean;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beyond.app';

export function generatePageMetadata({
  title,
  description,
  locale,
  path,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = `${baseUrl}/${locale}${path}`;

  return {
    title,
    description,
    robots: noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: url,
      languages: {
        fr: `${baseUrl}/fr${path}`,
        en: `${baseUrl}/en${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Beyond',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function getBaseUrl(): string {
  return baseUrl;
}
