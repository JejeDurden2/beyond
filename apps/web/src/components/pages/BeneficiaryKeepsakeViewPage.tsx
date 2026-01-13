'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { getBeneficiaryKeepsake, recordKeepsakeView } from '@/lib/api';
import {
  KeepsakeVisualizationWrapper,
  PersonalMessageModal,
} from '@/components/features/beneficiary';
import { Loader2 } from 'lucide-react';

interface BeneficiaryKeepsakeViewPageProps {
  keepsakeId: string;
}

export function BeneficiaryKeepsakeViewPage({ keepsakeId }: BeneficiaryKeepsakeViewPageProps) {
  const t = useTranslations('beneficiary');
  const router = useRouter();
  const [showPersonalMessage, setShowPersonalMessage] = useState(false);
  const [hasShownMessage, setHasShownMessage] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['beneficiary-keepsake', keepsakeId],
    queryFn: () => getBeneficiaryKeepsake(keepsakeId),
  });

  const recordViewMutation = useMutation({
    mutationFn: () => recordKeepsakeView(keepsakeId),
  });

  useEffect(() => {
    if (!data || hasShownMessage) {
      return;
    }

    if (data.hasPersonalMessage && data.personalMessage) {
      setShowPersonalMessage(true);
      setHasShownMessage(true);
    } else {
      recordViewMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, hasShownMessage]);

  const handleClosePersonalMessage = () => {
    setShowPersonalMessage(false);
    router.push('/portal');
  };

  const handleContinueFromMessage = () => {
    setShowPersonalMessage(false);
    recordViewMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gold-heritage animate-spin mx-auto mb-4" />
          <p className="text-slate">{t('portal.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{t('errors.keepsakeNotFound')}</p>
          <button
            onClick={() => router.push('/portal')}
            className="text-navy-light hover:text-gold-heritage"
          >
            {t('visualization.actions.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Personal message modal */}
      {showPersonalMessage && data.personalMessage && (
        <PersonalMessageModal
          message={data.personalMessage}
          senderName={data.senderName}
          onClose={handleClosePersonalMessage}
          onContinue={handleContinueFromMessage}
        />
      )}

      {/* Keepsake visualization */}
      {!showPersonalMessage && (
        <KeepsakeVisualizationWrapper
          type={data.type}
          title={data.title}
          content={data.content}
          senderName={data.senderName}
          deliveredAt={new Date(data.deliveredAt)}
          trigger={data.trigger}
        />
      )}
    </>
  );
}
