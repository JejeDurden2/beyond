'use client';

import { Link } from '@/i18n/navigation';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
}

export function BentoCard({ children, className = '', href }: BentoCardProps): React.ReactElement {
  const baseStyles =
    'bg-card rounded-2xl border border-border/50 shadow-soft p-6 transition-all duration-200 ease-out';
  const hoverStyles = href ? 'hover:shadow-soft-md hover:-translate-y-0.5' : '';
  const combinedStyles = `${baseStyles} ${hoverStyles} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    );
  }

  return <div className={combinedStyles}>{children}</div>;
}
