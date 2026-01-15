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

      <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-12">
        <h1 className="mb-4 font-serif-brand text-display-sm font-medium text-navy-deep">
          {title}
        </h1>
        <p className="mb-12 text-sm text-slate">{lastUpdated}</p>

        <div className="space-y-8">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
