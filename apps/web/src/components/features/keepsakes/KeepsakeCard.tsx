'use client';

import { useTranslations, useLocale } from 'next-intl';
import { KeepsakeTypeIcon } from '@/components/ui';
import { formatDate } from '@/lib/constants';
import type { KeepsakeSummary, KeepsakeStatus } from '@/types';

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
      bg: 'bg-gold-heritage/10',
      text: 'text-gold-heritage',
      dot: 'bg-gold-heritage',
    },
    delivered: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
  };

  const variant = variants[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${variant.bg} ${variant.text}`}
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
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        {visibleRecipients.map((recipient) => (
          <div
            key={recipient.id}
            className="w-6 h-6 rounded-full bg-accent/15 border-2 border-card flex items-center justify-center"
            title={recipient.fullName}
          >
            <span className="text-[10px] font-medium text-accent">{recipient.initials}</span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center">
            <span className="text-[10px] font-medium text-muted-foreground">+{remainingCount}</span>
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground ml-1">
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

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative w-full text-left bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden transition-all duration-200 ease-out hover:shadow-soft-md hover:border-border hover:-translate-y-0.5 disabled:opacity-70"
    >
      {/* Card Header with Type Icon */}
      <div className="relative h-24 bg-gradient-to-br from-warm-gray to-cream flex items-center justify-center">
        <KeepsakeTypeIcon
          type={keepsake.type}
          className="w-10 h-10 text-navy-light/40 group-hover:text-gold-heritage/60 transition-colors duration-200"
        />
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={keepsake.status} />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
          {keepsake.title}
        </h3>

        {recipients && recipients.length > 0 && <RecipientInitials recipients={recipients} />}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t(`types.${keepsake.type}`)}</span>
          <span>{formatDate(keepsake.updatedAt, locale)}</span>
        </div>
      </div>
    </button>
  );
}
