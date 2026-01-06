'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useBeneficiaries } from '@/hooks/use-beneficiaries';
import {
  useKeepsakeAssignments,
  useBulkUpdateAssignments,
  useUpdatePersonalMessage,
} from '@/hooks/use-assignments';
import type { KeepsakeAssignment, Relationship } from '@/types';

interface AssignmentSectionProps {
  keepsakeId: string;
}

const RELATIONSHIP_ICONS: Record<Relationship, string> = {
  SPOUSE: '💑',
  CHILD: '👶',
  PARENT: '👨‍👩‍👧',
  SIBLING: '👫',
  GRANDCHILD: '👶',
  GRANDPARENT: '👴',
  FRIEND: '🤝',
  COLLEAGUE: '💼',
  OTHER: '👤',
};

export function AssignmentSection({ keepsakeId }: AssignmentSectionProps) {
  const t = useTranslations('assignments');
  const tBeneficiaries = useTranslations('beneficiaries');

  const { data: beneficiariesData, isLoading: isLoadingBeneficiaries } = useBeneficiaries();
  const { data: assignmentsData, isLoading: isLoadingAssignments } =
    useKeepsakeAssignments(keepsakeId);
  const bulkUpdate = useBulkUpdateAssignments(keepsakeId);
  const updateMessage = useUpdatePersonalMessage(keepsakeId);

  const [showSelector, setShowSelector] = useState(false);
  const [editingMessageFor, setEditingMessageFor] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const beneficiaries = beneficiariesData?.beneficiaries ?? [];
  const assignments = assignmentsData?.assignments ?? [];
  const assignedBeneficiaryIds = new Set(assignments.map((a) => a.beneficiaryId));

  const handleToggleBeneficiary = async (beneficiaryId: string) => {
    const newIds = assignedBeneficiaryIds.has(beneficiaryId)
      ? assignments.filter((a) => a.beneficiaryId !== beneficiaryId).map((a) => a.beneficiaryId)
      : [...assignments.map((a) => a.beneficiaryId), beneficiaryId];

    await bulkUpdate.mutateAsync(newIds);
  };

  const handleSaveMessage = async (beneficiaryId: string) => {
    await updateMessage.mutateAsync({
      beneficiaryId,
      personalMessage: messageText.trim() || null,
    });
    setEditingMessageFor(null);
    setMessageText('');
  };

  const startEditMessage = (assignment: KeepsakeAssignment) => {
    setEditingMessageFor(assignment.beneficiaryId);
    setMessageText(assignment.personalMessage || '');
  };

  const isLoading = isLoadingBeneficiaries || isLoadingAssignments;

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-muted rounded-xl" />
          <div className="h-16 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground">{t('title')}</h3>
        {beneficiaries.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSelector(!showSelector)}
            className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
          >
            + {t('add')}
          </button>
        )}
      </div>

      {showSelector && (
        <div className="mb-4 p-4 border border-border/60 rounded-xl bg-background">
          <p className="text-sm font-medium text-foreground mb-3">{t('whoReceives')}</p>
          <div className="space-y-2">
            {beneficiaries.map((beneficiary) => (
              <label
                key={beneficiary.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={assignedBeneficiaryIds.has(beneficiary.id)}
                  onChange={() => handleToggleBeneficiary(beneficiary.id)}
                  disabled={bulkUpdate.isPending}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20"
                />
                <span className="text-lg">{RELATIONSHIP_ICONS[beneficiary.relationship]}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">
                    {beneficiary.fullName}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({tBeneficiaries(`relationships.${beneficiary.relationship}`)})
                  </span>
                </div>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowSelector(false)}
            className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {beneficiaries.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-2">{t('noBeneficiaries')}</p>
          <Link
            href="/beneficiaries/new"
            className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
          >
            {t('addBeneficiary')}
          </Link>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">{t('empty.description')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-start gap-3 p-3 border border-border/40 rounded-xl bg-background"
            >
              <span className="text-lg mt-0.5">
                {RELATIONSHIP_ICONS[assignment.beneficiaryRelationship]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {assignment.beneficiaryFullName}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({tBeneficiaries(`relationships.${assignment.beneficiaryRelationship}`)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleBeneficiary(assignment.beneficiaryId)}
                    disabled={bulkUpdate.isPending}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    {t('removeAssignment')}
                  </button>
                </div>

                {editingMessageFor === assignment.beneficiaryId ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={t('personalMessagePlaceholder')}
                      rows={2}
                      className="w-full text-sm rounded-lg border border-border/60 bg-background px-3 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingMessageFor(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveMessage(assignment.beneficiaryId)}
                        disabled={updateMessage.isPending}
                        className="text-xs text-accent hover:text-accent/80 font-medium"
                      >
                        {t('saveMessage')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    {assignment.personalMessage ? (
                      <p className="text-xs text-muted-foreground italic">
                        &ldquo;{assignment.personalMessage}&rdquo;
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t('noMessage')}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => startEditMessage(assignment)}
                      className="text-xs text-accent hover:text-accent/80 mt-1"
                    >
                      {t('editMessage')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
