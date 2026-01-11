'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Check, X, MessageSquare, Trash2, Plus } from 'lucide-react';
import { useBeneficiaries } from '@/hooks/use-beneficiaries';
import {
  useKeepsakeAssignments,
  useBulkUpdateAssignments,
  useUpdatePersonalMessage,
} from '@/hooks/use-assignments';
import { RelationshipIcon } from '@/components/ui';
import type { KeepsakeAssignment } from '@/types';

interface AssignmentSectionProps {
  keepsakeId: string;
}

export function AssignmentSection({ keepsakeId }: AssignmentSectionProps) {
  const t = useTranslations('assignments');
  const tBeneficiaries = useTranslations('beneficiaries');
  const tCommon = useTranslations('common');

  const { data: beneficiariesData, isLoading: isLoadingBeneficiaries } = useBeneficiaries();
  const { data: assignmentsData, isLoading: isLoadingAssignments } =
    useKeepsakeAssignments(keepsakeId);
  const bulkUpdate = useBulkUpdateAssignments(keepsakeId);
  const updateMessage = useUpdatePersonalMessage(keepsakeId);

  const [editingMessageFor, setEditingMessageFor] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const beneficiaries = beneficiariesData?.beneficiaries ?? [];
  const assignments = assignmentsData?.assignments ?? [];
  const assignedBeneficiaryIds = new Set(assignments.map((a) => a.beneficiaryId));
  const unassignedBeneficiaries = beneficiaries.filter((b) => !assignedBeneficiaryIds.has(b.id));

  const handleAddBeneficiary = async (beneficiaryId: string) => {
    const newIds = [...assignments.map((a) => a.beneficiaryId), beneficiaryId];
    await bulkUpdate.mutateAsync(newIds);
  };

  const handleRemoveBeneficiary = async (beneficiaryId: string) => {
    const newIds = assignments
      .filter((a) => a.beneficiaryId !== beneficiaryId)
      .map((a) => a.beneficiaryId);
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

  // No beneficiaries at all - show CTA to create one
  if (beneficiaries.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6">
        <h3 className="font-medium text-foreground mb-4">{t('title')}</h3>
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-3">{t('noBeneficiaries')}</p>
          <Link
            href="/beneficiaries/new"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {t('addBeneficiary')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6">
      <h3 className="font-medium text-foreground mb-4">{t('title')}</h3>

      {/* Assigned beneficiaries */}
      {assignments.length > 0 && (
        <div className="space-y-2 mb-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="border border-border/40 rounded-xl bg-background overflow-hidden"
            >
              <div className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <RelationshipIcon
                    relationship={assignment.beneficiaryRelationship}
                    className="w-4 h-4 text-accent"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {assignment.beneficiaryFullName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tBeneficiaries(`relationships.${assignment.beneficiaryRelationship}`)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEditMessage(assignment)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    title={t('editMessage')}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveBeneficiary(assignment.beneficiaryId)}
                    disabled={bulkUpdate.isPending}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title={t('removeAssignment')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Personal message section */}
              {editingMessageFor === assignment.beneficiaryId ? (
                <div className="px-3 pb-3 pt-1 border-t border-border/40">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={t('personalMessagePlaceholder')}
                    rows={2}
                    className="w-full text-sm rounded-lg border border-border/60 bg-background px-3 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 resize-none"
                  />
                  <div className="flex gap-2 justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => setEditingMessageFor(null)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors"
                    >
                      <X className="w-3 h-3" />
                      {tCommon('cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveMessage(assignment.beneficiaryId)}
                      disabled={updateMessage.isPending}
                      className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-medium px-2 py-1 rounded transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      {tCommon('save')}
                    </button>
                  </div>
                </div>
              ) : assignment.personalMessage ? (
                <div className="px-3 pb-3 pt-1 border-t border-border/40">
                  <p className="text-xs text-muted-foreground italic">
                    &ldquo;{assignment.personalMessage}&rdquo;
                  </p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Empty state when no assignments */}
      {assignments.length === 0 && (
        <p className="text-sm text-muted-foreground mb-4">{t('empty.description')}</p>
      )}

      {/* Unassigned beneficiaries - click to add */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">{t('whoReceives')}</p>
        <div className="flex flex-wrap gap-2">
          {unassignedBeneficiaries.map((beneficiary) => (
            <button
              key={beneficiary.id}
              type="button"
              onClick={() => handleAddBeneficiary(beneficiary.id)}
              disabled={bulkUpdate.isPending}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-background hover:border-accent hover:bg-accent/5 text-sm text-foreground transition-colors disabled:opacity-50"
            >
              <RelationshipIcon
                relationship={beneficiary.relationship}
                className="w-3.5 h-3.5 text-muted-foreground"
              />
              {beneficiary.fullName}
            </button>
          ))}
          <Link
            href="/beneficiaries/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-border/60 bg-background hover:border-accent hover:bg-accent/5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('createNew')}
          </Link>
        </div>
      </div>
    </div>
  );
}
