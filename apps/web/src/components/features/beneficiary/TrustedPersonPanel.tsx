'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Shield, Mail, CheckCircle, Clock, XCircle, Send } from 'lucide-react';

interface Beneficiary {
  id: string;
  name: string;
  email: string;
  invitationStatus: 'pending' | 'accepted' | 'expired';
  invitationSentAt?: Date;
}

interface TrustedPersonPanelProps {
  beneficiaries: Beneficiary[];
  onResendInvitation: (beneficiaryId: string) => Promise<void>;
}

type InvitationStatus = 'pending' | 'accepted' | 'expired';

interface InvitationStatusBadgeProps {
  status: InvitationStatus;
}

function InvitationStatusBadge({ status }: InvitationStatusBadgeProps): React.ReactNode {
  const t = useTranslations('beneficiary.trustedPerson');

  if (status === 'accepted') {
    return null;
  }

  if (status === 'pending') {
    return (
      <span className="flex items-center gap-1 text-xs bg-warm-gray px-2 py-1 rounded-full text-slate">
        <Clock className="w-3 h-3" />
        <span className="hidden sm:inline">{t('panel.beneficiaries.status.pending')}</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs bg-red-50 px-2 py-1 rounded-full text-red-600">
      <XCircle className="w-3 h-3" />
      <span className="hidden sm:inline">{t('panel.beneficiaries.status.expired')}</span>
    </span>
  );
}

export function TrustedPersonPanel({ beneficiaries, onResendInvitation }: TrustedPersonPanelProps) {
  const t = useTranslations('beneficiary.trustedPerson');
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resentIds, setResentIds] = useState<Set<string>>(new Set());

  const handleResend = async (beneficiaryId: string) => {
    setResendingId(beneficiaryId);
    try {
      await onResendInvitation(beneficiaryId);
      setResentIds((prev) => new Set(prev).add(beneficiaryId));
      // Clear the "resent" badge after 3 seconds
      setTimeout(() => {
        setResentIds((prev) => {
          const next = new Set(prev);
          next.delete(beneficiaryId);
          return next;
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to resend invitation:', error);
    } finally {
      setResendingId(null);
    }
  };

  const pendingBeneficiaries = beneficiaries.filter((b) => b.invitationStatus !== 'accepted');

  if (pendingBeneficiaries.length === 0) {
    return null;
  }

  return (
    <div className="bg-warm-gray rounded-2xl p-4 md:p-6 mb-6">
      {/* Header with badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gold-heritage/10 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-gold-heritage" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-serif-brand text-lg md:text-xl text-navy-deep">
              {t('panel.title')}
            </h2>
            <span className="text-xs bg-gold-heritage/10 text-gold-heritage px-2 py-1 rounded-full font-medium">
              {t('badge')}
            </span>
          </div>
          <p className="text-sm text-slate mt-1 hidden sm:block">{t('panel.subtitle')}</p>
        </div>
      </div>

      {/* Subtitle for mobile */}
      <p className="text-sm text-slate mb-4 sm:hidden">{t('panel.subtitle')}</p>

      {/* Beneficiaries list */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-navy-deep mb-3">
          {t('panel.beneficiaries.title')}
        </h3>

        {pendingBeneficiaries.map((beneficiary) => (
          <div
            key={beneficiary.id}
            className="bg-cream rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            {/* Beneficiary info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-slate/60 flex-shrink-0" />
                <p className="text-sm font-medium text-navy-deep truncate">{beneficiary.name}</p>
              </div>
              <p className="text-xs text-slate truncate pl-6">{beneficiary.email}</p>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <InvitationStatusBadge status={beneficiary.invitationStatus} />

              {/* Resend button */}
              {beneficiary.invitationStatus !== 'accepted' && (
                <button
                  onClick={() => handleResend(beneficiary.id)}
                  disabled={resendingId === beneficiary.id}
                  className="text-xs bg-gold-heritage text-cream px-3 py-1.5 rounded-lg hover:bg-gold-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
                >
                  {resendingId === beneficiary.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                      <span className="hidden sm:inline">...</span>
                    </>
                  ) : resentIds.has(beneficiary.id) ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      <span>{t('panel.beneficiaries.actions.resent')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>{t('panel.beneficiaries.actions.resend')}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
