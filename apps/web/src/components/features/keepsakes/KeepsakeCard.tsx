'use client';

import { useTranslations, useLocale } from 'next-intl';
import { KeepsakeTypeIcon } from '@/components/ui';
import { formatDate } from '@/lib/constants';
import type { KeepsakeSummary, KeepsakeStatus, KeepsakeType } from '@/types';

// Clean, refined color themes - visible but elegant
const typeThemes: Record<KeepsakeType, { bg: string; accent: string; border: string }> = {
  letter: {
    bg: 'bg-amber-50',
    accent: 'text-amber-700',
    border: 'border-amber-200/60',
  },
  document: {
    bg: 'bg-slate-50',
    accent: 'text-slate-600',
    border: 'border-slate-200/60',
  },
  photo: {
    bg: 'bg-sky-50',
    accent: 'text-sky-700',
    border: 'border-sky-200/60',
  },
  video: {
    bg: 'bg-violet-50',
    accent: 'text-violet-700',
    border: 'border-violet-200/60',
  },
  wish: {
    bg: 'bg-rose-50',
    accent: 'text-rose-700',
    border: 'border-rose-200/60',
  },
  scheduled_action: {
    bg: 'bg-emerald-50',
    accent: 'text-emerald-700',
    border: 'border-emerald-200/60',
  },
};

export interface RecipientPreview {
  id: string;
  initials: string;
  fullName: string;
}

interface KeepsakeCardProps {
  keepsake: KeepsakeSummary;
  onClick: () => void;
  disabled?: boolean;
  recipients?: RecipientPreview[];
}

interface StatusBadgeProps {
  status: KeepsakeStatus;
}

function StatusBadge({ status }: StatusBadgeProps): React.ReactElement | null {
  const t = useTranslations('keepsakes.status');

  // Don't show badge for drafts
  if (status === 'draft') return null;

  const variants: Record<
    Exclude<KeepsakeStatus, 'draft'>,
    { bg: string; text: string; dot: string }
  > = {
    scheduled: {
      bg: 'bg-gold-heritage/15',
      text: 'text-gold-heritage',
      dot: 'bg-gold-heritage',
    },
    delivered: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
  };

  const variant = variants[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${variant.bg} ${variant.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${variant.dot}`} />
      {t(status)}
    </span>
  );
}

const MAX_VISIBLE_RECIPIENTS = 3;

interface RecipientInitialsProps {
  recipients: RecipientPreview[];
}

function RecipientInitials({ recipients }: RecipientInitialsProps): React.ReactElement | null {
  const t = useTranslations('keepsakes.card');

  if (!recipients || recipients.length === 0) return null;

  const visibleRecipients = recipients.slice(0, MAX_VISIBLE_RECIPIENTS);
  const remainingCount = recipients.length - MAX_VISIBLE_RECIPIENTS;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-1.5">
        {visibleRecipients.map((recipient) => (
          <div
            key={recipient.id}
            className="w-5 h-5 rounded-full bg-navy-deep/10 border border-card flex items-center justify-center"
            title={recipient.fullName}
          >
            <span className="text-[9px] font-medium text-navy-deep">{recipient.initials}</span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-5 h-5 rounded-full bg-muted border border-card flex items-center justify-center">
            <span className="text-[9px] font-medium text-muted-foreground">+{remainingCount}</span>
          </div>
        )}
      </div>
      <span className="text-[11px] text-muted-foreground">
        {t('recipients', { count: recipients.length })}
      </span>
    </div>
  );
}

export function KeepsakeCard({
  keepsake,
  onClick,
  disabled,
  recipients,
}: KeepsakeCardProps): React.ReactElement {
  const t = useTranslations('keepsakes');
  const locale = useLocale();
  const theme = typeThemes[keepsake.type];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative w-full text-left bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden transition-all duration-200 ease-out hover:shadow-md hover:border-border/80 hover:-translate-y-0.5 disabled:opacity-70"
    >
      {/* Colored accent bar at top */}
      <div className={`h-1.5 ${theme.bg}`} />

      {/* Card Content */}
      <div className="p-4">
        {/* Header row: icon + status */}
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-10 h-10 rounded-lg ${theme.bg} ${theme.border} border flex items-center justify-center`}
          >
            <KeepsakeTypeIcon type={keepsake.type} className={`w-5 h-5 ${theme.accent}`} />
          </div>
          <StatusBadge status={keepsake.status} />
        </div>

        {/* Title */}
        <h3 className="font-medium text-foreground line-clamp-2 mb-1 min-h-[2.5rem]">
          {keepsake.title}
        </h3>

        {/* Type label */}
        <p className={`text-[11px] font-medium ${theme.accent} uppercase tracking-wide mb-3`}>
          {t(`types.${keepsake.type}`)}
        </p>

        {/* Footer: recipients + date */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          {recipients && recipients.length > 0 ? (
            <RecipientInitials recipients={recipients} />
          ) : (
            <span className="text-[11px] text-muted-foreground/60">
              {t('card.recipients', { count: 0 })}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">
            {formatDate(keepsake.updatedAt, locale)}
          </span>
        </div>
      </div>
    </button>
  );
}
