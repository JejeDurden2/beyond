import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: LegalLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-3xl w-full px-6">
          {/* Hero section */}
          <div className="text-center mb-16">
            <h1 className="font-serif-brand text-display-sm md:text-display font-medium text-navy-deep mb-4">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{lastUpdated}</p>
          </div>

          {/* Content card */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8 md:p-12">
            <div className="space-y-10">{children}</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
