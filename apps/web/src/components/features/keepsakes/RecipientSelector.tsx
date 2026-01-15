'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, ChevronDown, ChevronUp, MessageSquare, Check } from 'lucide-react';
import { useBeneficiaries } from '@/hooks/use-beneficiaries';
import { RelationshipIcon } from '@/components/ui';
import { QuickAddBeneficiaryModal } from '@/components/features/beneficiaries';
import type { Beneficiary } from '@/types';

export interface RecipientWithMessage {
  beneficiaryId: string;
  beneficiary: Beneficiary;
  personalMessage: string;
}

interface RecipientSelectorProps {
  selectedRecipients: RecipientWithMessage[];
  onRecipientsChange: (recipients: RecipientWithMessage[]) => void;
}

export function RecipientSelector({
  selectedRecipients,
  onRecipientsChange,
}: RecipientSelectorProps): React.ReactElement {
  const t = useTranslations('keepsakes.form');
  const tBeneficiaries = useTranslations('beneficiaries');
  const tAssignments = useTranslations('assignments');

  const [expandedRecipientId, setExpandedRecipientId] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const { data: beneficiariesData, isLoading } = useBeneficiaries();
  const beneficiaries = beneficiariesData?.beneficiaries ?? [];

  const selectedIds = new Set(selectedRecipients.map((r) => r.beneficiaryId));
  const unselectedBeneficiaries = beneficiaries.filter((b) => !selectedIds.has(b.id));

  const toggleRecipient = (beneficiary: Beneficiary): void => {
    if (selectedIds.has(beneficiary.id)) {
      onRecipientsChange(selectedRecipients.filter((r) => r.beneficiaryId !== beneficiary.id));
      if (expandedRecipientId === beneficiary.id) {
        setExpandedRecipientId(null);
      }
    } else {
      onRecipientsChange([
        ...selectedRecipients,
        { beneficiaryId: beneficiary.id, beneficiary, personalMessage: '' },
      ]);
    }
  };

  const updatePersonalMessage = (beneficiaryId: string, message: string): void => {
    onRecipientsChange(
      selectedRecipients.map((r) =>
        r.beneficiaryId === beneficiaryId ? { ...r, personalMessage: message } : r,
      ),
    );
  };

  const toggleExpanded = (beneficiaryId: string): void => {
    setExpandedRecipientId((prev) => (prev === beneficiaryId ? null : beneficiaryId));
  };

  const handleQuickAddSuccess = (beneficiary: Beneficiary): void => {
    setShowQuickAdd(false);
    onRecipientsChange([
      ...selectedRecipients,
      { beneficiaryId: beneficiary.id, beneficiary, personalMessage: '' },
    ]);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="h-16 bg-muted rounded-xl" />
        <div className="h-16 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-foreground">{t('recipientsTitle')}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{t('recipientsSubtitle')}</p>
      </div>

      {/* Selected recipients */}
      {selectedRecipients.length > 0 && (
        <div className="space-y-2">
          {selectedRecipients.map((recipient) => (
            <div
              key={recipient.beneficiaryId}
              className="border border-accent/30 bg-accent/5 rounded-xl overflow-hidden transition-all duration-200 ease-out"
            >
              <div className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggleRecipient(recipient.beneficiary)}
                  className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ease-out hover:bg-accent/30"
                >
                  <RelationshipIcon
                    relationship={recipient.beneficiary.relationship}
                    className="w-5 h-5 text-accent"
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {recipient.beneficiary.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tBeneficiaries(`relationships.${recipient.beneficiary.relationship}`)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(recipient.beneficiaryId)}
                    className={`p-2 rounded-lg transition-colors duration-200 ease-out ${
                      recipient.personalMessage
                        ? 'text-accent'
                        : 'text-muted-foreground hover:text-foreground'
                    } hover:bg-muted/50`}
                    aria-label={t('addPersonalMessage')}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(recipient.beneficiaryId)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200 ease-out"
                    aria-label={
                      expandedRecipientId === recipient.beneficiaryId ? 'Collapse' : 'Expand'
                    }
                    aria-expanded={expandedRecipientId === recipient.beneficiaryId}
                  >
                    {expandedRecipientId === recipient.beneficiaryId ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  className="w-6 h-6 rounded-full border-2 border-accent bg-accent text-white flex items-center justify-center"
                  onClick={() => toggleRecipient(recipient.beneficiary)}
                  aria-label="Remove recipient"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>

              {/* Expandable personal message */}
              {expandedRecipientId === recipient.beneficiaryId && (
                <div className="px-3 pb-3 pt-1 border-t border-accent/20 animate-fade-in">
                  <label
                    htmlFor={`personal-message-${recipient.beneficiaryId}`}
                    className="block text-xs font-medium text-muted-foreground mb-1.5"
                  >
                    {t('addPersonalMessage')}
                  </label>
                  <textarea
                    id={`personal-message-${recipient.beneficiaryId}`}
                    name="personalMessage"
                    value={recipient.personalMessage}
                    onChange={(e) => updatePersonalMessage(recipient.beneficiaryId, e.target.value)}
                    placeholder={t('personalMessagePlaceholder')}
                    rows={3}
                    className="w-full text-sm rounded-lg border border-border/60 bg-background px-3 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 resize-none transition-colors duration-200 ease-out"
                  />
                </div>
              )}

              {/* Show message preview when collapsed */}
              {expandedRecipientId !== recipient.beneficiaryId && recipient.personalMessage && (
                <div className="px-3 pb-2 pt-0.5">
                  <p className="text-xs text-muted-foreground italic line-clamp-1">
                    &ldquo;{recipient.personalMessage}&rdquo;
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Unselected beneficiaries */}
      {unselectedBeneficiaries.length > 0 && (
        <div className="space-y-2">
          {selectedRecipients.length > 0 && (
            <p className="text-xs font-medium text-muted-foreground pt-2">
              {tAssignments('whoReceives')}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {unselectedBeneficiaries.map((beneficiary) => (
              <button
                key={beneficiary.id}
                type="button"
                onClick={() => toggleRecipient(beneficiary)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 bg-background hover:border-accent hover:bg-accent/5 text-sm text-foreground transition-all duration-200 ease-out"
              >
                <RelationshipIcon
                  relationship={beneficiary.relationship}
                  className="w-4 h-4 text-muted-foreground"
                />
                {beneficiary.fullName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state or quick add */}
      <button
        type="button"
        onClick={() => setShowQuickAdd(true)}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border/40 text-muted-foreground hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-200 ease-out"
      >
        <Plus className="w-4 h-4" />
        {tAssignments('createNew')}
      </button>

      {/* No beneficiaries at all */}
      {beneficiaries.length === 0 && selectedRecipients.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          {tAssignments('noBeneficiaries')}
        </p>
      )}

      {/* Quick add modal */}
      <QuickAddBeneficiaryModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSuccess={handleQuickAddSuccess}
      />
    </div>
  );
}
