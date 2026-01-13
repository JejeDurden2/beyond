import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AcceptInvitationPage } from '@/components/pages/AcceptInvitationPage';

interface PageProps {
  params: Promise<{ locale: string; token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'beneficiary.welcome' });

  return {
    title: t('title'),
    description: t('message.single'),
  };
}

export default async function BeneficiaryAcceptInvitationPage({ params }: PageProps) {
  const { token } = await params;
  return <AcceptInvitationPage token={token} />;
}
