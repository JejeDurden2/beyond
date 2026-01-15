'use client';

import { useTranslations, useLocale } from 'next-intl';
import { KeepsakeTypeIcon } from '@/components/ui';
import { formatDate } from '@/lib/constants';
import type { KeepsakeSummary, KeepsakeStatus, KeepsakeType } from '@/types';

// Subtle, premium color themes per keepsake type
const typeThemes: Record<
  KeepsakeType,
  {
    gradient: string;
    accent: string;
    iconBg: string;
    pattern: 'lines' | 'dots' | 'waves' | 'grid' | 'arcs' | 'rings';
  }
> = {
  letter: {
    gradient: 'from-stone-50 to-warm-gray-50',
    accent: 'text-stone-600',
    iconBg: 'bg-stone-100/60',
    pattern: 'lines', // Elegant parallel lines like writing
  },
  document: {
    gradient: 'from-slate-50 to-gray-50',
    accent: 'text-slate-500',
    iconBg: 'bg-slate-100/60',
    pattern: 'grid', // Structured grid pattern
  },
  photo: {
    gradient: 'from-zinc-50 to-neutral-50',
    accent: 'text-zinc-500',
    iconBg: 'bg-zinc-100/60',
    pattern: 'dots', // Subtle halftone dots
  },
  video: {
    gradient: 'from-neutral-50 to-stone-50',
    accent: 'text-neutral-500',
    iconBg: 'bg-neutral-100/60',
    pattern: 'waves', // Flowing wave lines
  },
  wish: {
    gradient: 'from-amber-50/30 to-stone-50',
    accent: 'text-amber-700/70',
    iconBg: 'bg-amber-50/60',
    pattern: 'arcs', // Graceful arcs
  },
  scheduled_action: {
    gradient: 'from-slate-50 to-zinc-50',
    accent: 'text-slate-500',
    iconBg: 'bg-slate-100/60',
    pattern: 'rings', // Concentric rings like a clock
  },
};

// Premium decorative patterns for each type
function CardPattern({ pattern }: { pattern: string }): React.ReactElement {
  const baseClass = 'absolute inset-0 overflow-hidden pointer-events-none';

  switch (pattern) {
    case 'lines':
      // Elegant diagonal lines - like writing paper
      return (
        <div className={baseClass}>
          <div className="absolute inset-0 opacity-[0.04]">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute h-px bg-navy-deep"
                style={{
                  left: '-10%',
                  right: '-10%',
                  top: `${15 + i * 12}%`,
                  transform: 'rotate(-3deg)',
                }}
              />
            ))}
          </div>
        </div>
      );

    case 'grid':
      // Structured grid - documents/organization
      return (
        <div className={baseClass}>
          <div className="absolute inset-0 opacity-[0.03]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, currentColor 1px, transparent 1px),
                  linear-gradient(to bottom, currentColor 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px',
              }}
            />
          </div>
        </div>
      );

    case 'dots':
      // Halftone dots - photography feel
      return (
        <div className={baseClass}>
          <div className="absolute inset-0 opacity-[0.04]">
            {[...Array(6)].map((_, row) =>
              [...Array(8)].map((_, col) => (
                <div
                  key={`${row}-${col}`}
                  className="absolute w-1 h-1 rounded-full bg-navy-deep"
                  style={{
                    left: `${8 + col * 12}%`,
                    top: `${12 + row * 16}%`,
                  }}
                />
              )),
            )}
          </div>
        </div>
      );

    case 'waves':
      // Flowing waves - motion/video
      return (
        <div className={baseClass}>
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" preserveAspectRatio="none">
            <path
              d="M0,40 Q50,20 100,40 T200,40 T300,40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-navy-deep"
            />
            <path
              d="M0,60 Q50,40 100,60 T200,60 T300,60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-navy-deep"
            />
            <path
              d="M0,80 Q50,60 100,80 T200,80 T300,80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-navy-deep"
            />
          </svg>
        </div>
      );

    case 'arcs':
      // Graceful arcs - wishes/aspirations
      return (
        <div className={baseClass}>
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" preserveAspectRatio="none">
            <path
              d="M-20,120 Q80,20 180,120"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-navy-deep"
            />
            <path
              d="M20,140 Q120,40 220,140"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-navy-deep"
            />
          </svg>
        </div>
      );

    case 'rings':
      // Concentric rings - time/scheduling
      return (
        <div className={baseClass}>
          <div className="absolute -right-8 -top-8 opacity-[0.04]">
            <div className="w-32 h-32 rounded-full border border-navy-deep" />
            <div className="absolute inset-3 rounded-full border border-navy-deep" />
            <div className="absolute inset-6 rounded-full border border-navy-deep" />
          </div>
        </div>
      );

    default:
      return <div className={baseClass} />;
  }
}

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
      {/* Card Header with subtle gradient and unique pattern */}
      <div className={`relative h-28 bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
        {/* Type-specific decorative pattern */}
        <CardPattern pattern={theme.pattern} />

        {/* Type icon container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-12 h-12 rounded-xl ${theme.iconBg} shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
          >
            <KeepsakeTypeIcon type={keepsake.type} className={`w-6 h-6 ${theme.accent}`} />
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={keepsake.status} />
        </div>

        {/* Type label */}
        <div className="absolute bottom-3 left-3">
          <span className={`text-[11px] font-medium ${theme.accent} uppercase tracking-wider`}>
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
