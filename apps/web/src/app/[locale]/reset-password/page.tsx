import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/seo';
import { ResetPasswordForm } from '@/components/features/auth';
import type { Locale } from '../../../../i18n.config';

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo.resetPassword' });

  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    path: '/reset-password',
  });
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
