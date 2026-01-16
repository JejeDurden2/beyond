'use client';

import { useTranslations, useLocale } from 'next-intl';
import { KeepsakeTypeIcon } from '@/components/ui';
import { formatDate } from '@/lib/constants';
import type { KeepsakeSummary, KeepsakeStatus, KeepsakeType } from '@/types';

// Glassmorphism color themes with gradient backgrounds
const typeThemes: Record<
  KeepsakeType,
  { gradient: string; iconGradient: string; accent: string; glow: string }
> = {
  letter: {
    gradient: 'from-amber-100/80 via-orange-50/60 to-amber-50/40',
    iconGradient: 'from-amber-200/90 to-amber-100/70',
    accent: 'text-amber-700',
    glow: 'shadow-amber-200/30',
  },
  document: {
    gradient: 'from-slate-100/80 via-gray-50/60 to-slate-50/40',
    iconGradient: 'from-slate-200/90 to-slate-100/70',
    accent: 'text-slate-600',
    glow: 'shadow-slate-200/30',
  },
  photo: {
    gradient: 'from-sky-100/80 via-blue-50/60 to-sky-50/40',
    iconGradient: 'from-sky-200/90 to-sky-100/70',
    accent: 'text-sky-700',
    glow: 'shadow-sky-200/30',
  },
  video: {
    gradient: 'from-violet-100/80 via-purple-50/60 to-violet-50/40',
    iconGradient: 'from-violet-200/90 to-violet-100/70',
    accent: 'text-violet-700',
    glow: 'shadow-violet-200/30',
  },
  wish: {
    gradient: 'from-rose-100/80 via-pink-50/60 to-rose-50/40',
    iconGradient: 'from-rose-200/90 to-rose-100/70',
    accent: 'text-rose-700',
    glow: 'shadow-rose-200/30',
  },
  scheduled_action: {
    gradient: 'from-emerald-100/80 via-teal-50/60 to-emerald-50/40',
    iconGradient: 'from-emerald-200/90 to-emerald-100/70',
    accent: 'text-emerald-700',
    glow: 'shadow-emerald-200/30',
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

  if (status === 'draft') return null;

  const variants: Record<
    Exclude<KeepsakeStatus, 'draft'>,
    { bg: string; text: string; dot: string }
  > = {
    scheduled: {
      bg: 'bg-white/60 backdrop-blur-sm border border-gold-heritage/20',
      text: 'text-gold-heritage',
      dot: 'bg-gold-heritage',
    },
    delivered: {
      bg: 'bg-white/60 backdrop-blur-sm border border-emerald-300/30',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
  };

  const variant = variants[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${variant.bg} ${variant.text}`}
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
            className="w-6 h-6 rounded-full bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm flex items-center justify-center"
            title={recipient.fullName}
          >
            <span className="text-[9px] font-semibold text-navy-deep">{recipient.initials}</span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-6 h-6 rounded-full bg-white/50 backdrop-blur-sm border border-white/40 flex items-center justify-center">
            <span className="text-[9px] font-medium text-muted-foreground">+{remainingCount}</span>
          </div>
        )}
      </div>
      <span className="text-[11px] text-foreground/60">
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
      className={`group relative w-full text-left rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 shadow-lg ${theme.glow}`}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />

      {/* Subtle border */}
      <div className="absolute inset-0 rounded-2xl border border-white/50" />

      {/* Content */}
      <div className="relative p-5">
        {/* Header: Icon + Status */}
        <div className="flex items-start justify-between mb-4">
          {/* Frosted icon container */}
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.iconGradient} backdrop-blur-sm border border-white/60 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
          >
            <KeepsakeTypeIcon type={keepsake.type} className={`w-6 h-6 ${theme.accent}`} />
          </div>
          <StatusBadge status={keepsake.status} />
        </div>

        {/* Type label */}
        <p className={`text-[10px] font-semibold ${theme.accent} uppercase tracking-wider mb-1.5`}>
          {t(`types.${keepsake.type}`)}
        </p>

        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 min-h-[2.75rem] mb-4">
          {keepsake.title}
        </h3>

        {/* Footer with glass effect */}
        <div className="flex items-center justify-between pt-3 border-t border-white/40">
          {recipients && recipients.length > 0 ? (
            <RecipientInitials recipients={recipients} />
          ) : (
            <span className="text-[11px] text-foreground/40">
              {t('card.recipients', { count: 0 })}
            </span>
          )}
          <span className="text-[11px] text-foreground/50 font-medium">
            {formatDate(keepsake.updatedAt, locale)}
          </span>
        </div>
      </div>
    </button>
  );
}
