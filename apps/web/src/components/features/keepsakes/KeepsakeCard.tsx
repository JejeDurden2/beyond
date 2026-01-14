'use client';

import { useTranslations } from 'next-intl';
import { KeepsakeTypeIcon } from '@/components/ui';
import { formatDate } from '@/lib/constants';
import type { KeepsakeSummary, KeepsakeStatus } from '@/types';

interface KeepsakeCardProps {
  keepsake: KeepsakeSummary;
  onClick: () => void;
  disabled?: boolean;
}

interface StatusBadgeProps {
  status: KeepsakeStatus;
}

function StatusBadge({ status }: StatusBadgeProps): React.ReactElement {
  const t = useTranslations('keepsakes.status');

  const variants: Record<KeepsakeStatus, { bg: string; text: string; dot: string }> = {
    draft: {
      bg: 'bg-warm-gray',
      text: 'text-slate',
      dot: 'bg-slate',
    },
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

export function KeepsakeCard({
  keepsake,
  onClick,
  disabled,
}: KeepsakeCardProps): React.ReactElement {
  const t = useTranslations('keepsakes');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative w-full text-left bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden transition-all duration-200 ease-out hover:shadow-soft-md hover:border-border disabled:opacity-70"
    >
      {/* Card Header with Type Icon */}
      <div className="relative h-24 bg-gradient-to-br from-warm-gray to-cream flex items-center justify-center">
        <KeepsakeTypeIcon
          type={keepsake.type}
          className="w-10 h-10 text-navy-light/40 group-hover:text-gold-heritage/60 transition-colors duration-200"
        />
        {/* Status Badge - Absolute positioned */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={keepsake.status} />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
          {keepsake.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t(`types.${keepsake.type}`)}</span>
          <span>{formatDate(keepsake.updatedAt)}</span>
        </div>
      </div>
    </button>
  );
}
