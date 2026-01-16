'use client';

import { Link } from '@/i18n/navigation';

export type GlassVariant = 'neutral' | 'gold' | 'emerald' | 'amber' | 'sky' | 'rose' | 'violet';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  variant?: GlassVariant;
  intensity?: 'subtle' | 'medium' | 'strong';
}

// Glassmorphism color themes - subtle gradient backgrounds
const variantThemes: Record<GlassVariant, { gradient: string; glow: string; border: string }> = {
  neutral: {
    gradient: 'from-slate-50/40 via-gray-50/20 to-white/10',
    glow: 'shadow-slate-100/10',
    border: 'border-white/40',
  },
  gold: {
    gradient: 'from-amber-50/50 via-orange-50/25 to-white/10',
    glow: 'shadow-amber-100/15',
    border: 'border-amber-100/30',
  },
  emerald: {
    gradient: 'from-emerald-50/50 via-teal-50/25 to-white/10',
    glow: 'shadow-emerald-100/15',
    border: 'border-emerald-100/30',
  },
  amber: {
    gradient: 'from-amber-50/60 via-yellow-50/30 to-white/10',
    glow: 'shadow-amber-100/20',
    border: 'border-amber-200/40',
  },
  sky: {
    gradient: 'from-sky-50/50 via-blue-50/25 to-white/10',
    glow: 'shadow-sky-100/15',
    border: 'border-sky-100/30',
  },
  rose: {
    gradient: 'from-rose-50/50 via-pink-50/25 to-white/10',
    glow: 'shadow-rose-100/15',
    border: 'border-rose-100/30',
  },
  violet: {
    gradient: 'from-violet-50/50 via-purple-50/25 to-white/10',
    glow: 'shadow-violet-100/15',
    border: 'border-violet-100/30',
  },
};

const intensityConfig = {
  subtle: {
    blur: 'backdrop-blur-[2px]',
    overlay: 'bg-white/20',
  },
  medium: {
    blur: 'backdrop-blur-sm',
    overlay: 'bg-white/30',
  },
  strong: {
    blur: 'backdrop-blur-md',
    overlay: 'bg-white/40',
  },
};

export function GlassCard({
  children,
  className = '',
  href,
  variant = 'neutral',
  intensity = 'medium',
}: GlassCardProps): React.ReactElement {
  const theme = variantThemes[variant];
  const blur = intensityConfig[intensity];

  const content = (
    <>
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />

      {/* Glass overlay */}
      <div className={`absolute inset-0 ${blur.overlay} ${blur.blur}`} />

      {/* Subtle border */}
      <div className={`absolute inset-0 rounded-2xl border ${theme.border}`} />

      {/* Content */}
      <div className="relative">{children}</div>
    </>
  );

  const combinedStyles = [
    'relative rounded-2xl overflow-hidden shadow-lg transition-all duration-200 ease-out',
    theme.glow,
    href && 'hover:-translate-y-0.5 hover:shadow-xl',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={`block ${combinedStyles}`}>
        {content}
      </Link>
    );
  }

  return <div className={combinedStyles}>{content}</div>;
}
