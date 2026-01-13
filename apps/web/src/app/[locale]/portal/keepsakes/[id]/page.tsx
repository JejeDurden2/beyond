import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BeneficiaryKeepsakeViewPage } from '@/components/pages/BeneficiaryKeepsakeViewPage';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'beneficiary.portal' });

  return {
    title: t('title'),
  };
}

export default async function KeepsakeViewPage({ params }: PageProps) {
  const { id } = await params;
  return <BeneficiaryKeepsakeViewPage keepsakeId={id} />;
}
