import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BeneficiaryPortalPage } from '@/components/pages/BeneficiaryPortalPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'beneficiary.portal' });

  return {
    title: t('title'),
    description: t('empty.message'),
  };
}

export default function PortalPage() {
  return <BeneficiaryPortalPage />;
}
