'use client';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ProfileSection({ title, children, className = '' }: ProfileSectionProps) {
  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
        {title}
      </h3>
      <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden">
        {children}
      </div>
    </div>
  );
}
