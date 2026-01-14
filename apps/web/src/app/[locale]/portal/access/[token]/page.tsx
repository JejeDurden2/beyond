import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BeneficiaryAccessPage } from '@/components/pages/BeneficiaryAccessPage';

interface PageProps {
  params: Promise<{ locale: string; token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'beneficiary.access' });

  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default async function AccessPage({ params }: PageProps) {
  const { locale, token } = await params;

  return <BeneficiaryAccessPage token={token} locale={locale} />;
}
