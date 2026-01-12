import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { Footer } from '@/components/layout/Footer';
import { ChevronLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-cream">
      <header className="border-b border-warm-gray bg-cream px-6 py-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-navy-light transition-colors hover:text-gold-heritage"
          >
            <ChevronLeft className="h-4 w-4" />
            Beyond
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
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
