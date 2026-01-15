'use client';

import { useTranslations, useLocale } from 'next-intl';
import { KeepsakeTypeIcon } from '@/components/ui';
import { formatDate } from '@/lib/constants';
import type { KeepsakeSummary, KeepsakeStatus, KeepsakeType } from '@/types';

// Color themes per keepsake type for visual distinction
const typeThemes: Record<KeepsakeType, { gradient: string; accent: string; iconBg: string }> = {
  letter: {
    gradient: 'from-amber-50 via-orange-50/50 to-amber-50',
    accent: 'text-amber-600',
    iconBg: 'bg-amber-100/80',
  },
  story: {
    gradient: 'from-violet-50 via-purple-50/50 to-violet-50',
    accent: 'text-violet-600',
    iconBg: 'bg-violet-100/80',
  },
  advice: {
    gradient: 'from-emerald-50 via-teal-50/50 to-emerald-50',
    accent: 'text-emerald-600',
    iconBg: 'bg-emerald-100/80',
  },
  memory: {
    gradient: 'from-sky-50 via-blue-50/50 to-sky-50',
    accent: 'text-sky-600',
    iconBg: 'bg-sky-100/80',
  },
  wish: {
    gradient: 'from-rose-50 via-pink-50/50 to-rose-50',
    accent: 'text-rose-600',
    iconBg: 'bg-rose-100/80',
  },
  legacy: {
    gradient: 'from-gold-heritage/10 via-amber-50/50 to-gold-heritage/10',
    accent: 'text-gold-heritage',
    iconBg: 'bg-gold-heritage/20',
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
  const theme = typeThemes[keepsake.type];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative w-full text-left bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden transition-all duration-200 ease-out hover:shadow-soft-md hover:border-border hover:-translate-y-0.5 disabled:opacity-70"
    >
      {/* Card Header with Type Icon and colored gradient */}
      <div className={`relative h-28 bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
        {/* Decorative circles pattern */}
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full border border-navy-deep/5" />
        <div className="absolute -right-2 top-2 w-16 h-16 rounded-full border border-navy-deep/5" />
        <div className="absolute right-6 top-8 w-8 h-8 rounded-full bg-navy-deep/[0.02]" />

        {/* Type icon container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-14 h-14 rounded-2xl ${theme.iconBg} backdrop-blur-sm shadow-soft flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
          >
            <KeepsakeTypeIcon type={keepsake.type} className={`w-7 h-7 ${theme.accent}`} />
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={keepsake.status} />
        </div>

        {/* Type label */}
        <div className="absolute bottom-3 left-3">
          <span className={`text-xs font-medium ${theme.accent} uppercase tracking-wide`}>
            {t(`types.${keepsake.type}`)}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
          {keepsake.title}
        </h3>

        {recipients && recipients.length > 0 && <RecipientInitials recipients={recipients} />}

        <div className="text-xs text-muted-foreground">
          {formatDate(keepsake.updatedAt, locale)}
        </div>
      </div>
    </button>
  );
}
