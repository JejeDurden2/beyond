'use client';

import { Link } from '@/i18n/navigation';

export type BentoVariant = 'solid' | 'glass';
export type GlassAccent = 'neutral' | 'gold' | 'emerald' | 'amber';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  variant?: BentoVariant;
  glassAccent?: GlassAccent;
}

// Glass accent themes for subtle color tinting
const glassThemes: Record<GlassAccent, { gradient: string; border: string; glow: string }> = {
  neutral: {
    gradient: 'from-slate-50/40 via-gray-50/20 to-white/10',
    border: 'border-white/40',
    glow: '',
  },
  gold: {
    gradient: 'from-amber-50/40 via-orange-50/20 to-white/10',
    border: 'border-amber-100/20',
    glow: 'shadow-amber-100/10',
  },
  emerald: {
    gradient: 'from-emerald-50/40 via-teal-50/20 to-white/10',
    border: 'border-emerald-100/20',
    glow: 'shadow-emerald-100/10',
  },
  amber: {
    gradient: 'from-amber-50/50 via-yellow-50/25 to-white/10',
    border: 'border-amber-200/30',
    glow: 'shadow-amber-100/15',
  },
};

function renderCard(content: React.ReactNode, styles: string, href?: string): React.ReactElement {
  if (href) {
    return (
      <Link href={href} className={`block ${styles}`}>
        {content}
      </Link>
    );
  }
  return <div className={styles}>{content}</div>;
}

export function BentoCard({
  children,
  className = '',
  href,
  variant = 'glass',
  glassAccent = 'neutral',
}: BentoCardProps): React.ReactElement {
  const hoverStyles = href ? 'hover:shadow-soft-md hover:-translate-y-0.5' : '';

  if (variant === 'solid') {
    const solidStyles = [
      'bg-card rounded-2xl border border-border/50 shadow-soft p-6 transition-all duration-200 ease-out',
      hoverStyles,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return renderCard(children, solidStyles, href);
  }

  const theme = glassThemes[glassAccent];
  const glassContent = (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
      <div className={`absolute inset-0 rounded-2xl border ${theme.border}`} />
      <div className="relative p-6">{children}</div>
    </>
  );

  const glassStyles = [
    'relative rounded-2xl overflow-hidden shadow-lg transition-all duration-200 ease-out',
    theme.glow,
    hoverStyles,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return renderCard(glassContent, glassStyles, href);
}
