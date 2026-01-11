'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/layout';
import { KeepsakeTypeIcon, ChevronRight, Plus, Vault } from '@/components/ui';
import {
  KeepsakeVisualization,
  useKeepsakeVisualization,
} from '@/components/features/visualizations';
import { useAuth } from '@/hooks/use-auth';
import { getKeepsakes, getKeepsake } from '@/lib/api/keepsakes';
import { formatDate } from '@/lib/constants';
import type { KeepsakeSummary, KeepsakeType, Keepsake } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('dashboard');
  const tKeepsakes = useTranslations('keepsakes');
  const { isTextBased } = useKeepsakeVisualization();

  const [keepsakes, setKeepsakes] = useState<KeepsakeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Visualization state
  const [selectedKeepsake, setSelectedKeepsake] = useState<Keepsake | null>(null);
  const [isLoadingKeepsake, setIsLoadingKeepsake] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKeepsakes();
        setKeepsakes(data.keepsakes);
      } catch {
        // Silent fail - empty state will be shown
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleKeepsakeClick = useCallback(
    async (keepsake: KeepsakeSummary) => {
      // For non-text keepsakes, go directly to edit page
      if (!isTextBased(keepsake.type)) {
        router.push(`/keepsakes/${keepsake.id}`);
        return;
      }

      // For text-based keepsakes, load full content and show visualization
      setIsLoadingKeepsake(true);
      try {
        const fullKeepsake = await getKeepsake(keepsake.id);
        setSelectedKeepsake(fullKeepsake);
      } catch {
        // On error, fallback to edit page
        router.push(`/keepsakes/${keepsake.id}`);
      } finally {
        setIsLoadingKeepsake(false);
      }
    },
    [isTextBased, router],
  );

  const handleCloseVisualization = useCallback(() => {
    setSelectedKeepsake(null);
  }, []);

  const handleEditFromVisualization = useCallback(() => {
    if (selectedKeepsake) {
      router.push(`/keepsakes/${selectedKeepsake.id}`);
    }
  }, [selectedKeepsake, router]);

  return (
    <AppShell requireAuth>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-2 mb-12">
          <h1 className="font-display text-display-sm text-foreground">
            {t('welcome', { name: user?.firstName || '' })}
          </h1>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <ReassuranceCard />
          <StatCard
            title={t('stats.keepsakes.title')}
            value={isLoading ? '...' : keepsakes.length.toString()}
            subtitle={t('stats.keepsakes.count', { count: keepsakes.length })}
            linkTo="/keepsakes"
            linkLabel={t('recent.viewAll')}
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">{t('recent.title')}</h2>
            <Link
              href="/keepsakes/new"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-5 py-2.5 text-sm font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md"
            >
              + {tKeepsakes('new')}
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl border border-border/50 p-6 animate-pulse"
                >
                  <div className="h-5 w-48 bg-muted rounded" />
                  <div className="h-4 w-32 bg-muted rounded mt-2" />
                </div>
              ))}
            </div>
          ) : keepsakes.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {keepsakes.slice(0, 5).map((keepsake) => (
                <KeepsakeRow
                  key={keepsake.id}
                  keepsake={keepsake}
                  onClick={() => handleKeepsakeClick(keepsake)}
                  isLoading={isLoadingKeepsake}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visualization Modal */}
      {selectedKeepsake && (
        <KeepsakeVisualization
          type={selectedKeepsake.type}
          title={selectedKeepsake.title}
          content={selectedKeepsake.content || ''}
          onEdit={handleEditFromVisualization}
          onClose={handleCloseVisualization}
        />
      )}
    </AppShell>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  linkTo,
  linkLabel,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon?: React.ReactNode;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-display text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {linkTo && (
        <Link
          href={linkTo}
          className="inline-block mt-4 text-sm font-medium text-foreground hover:text-accent transition-colors duration-200 ease-out"
        >
          {linkLabel} <ChevronRight className="w-4 h-4 inline" />
        </Link>
      )}
    </div>
  );
}

function ReassuranceCard() {
  const t = useTranslations('dashboard.reassurance');

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Vault className="w-5 h-5 text-accent" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-foreground">{t('title')}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{t('description')}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const t = useTranslations('dashboard.empty');

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-12 text-center">
      <div className="max-w-sm mx-auto space-y-4">
        <div className="w-16 h-16 mx-auto bg-muted rounded-2xl flex items-center justify-center">
          <Plus className="w-8 h-8 text-icon-line" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-xl text-foreground">{t('title')}</h3>
        <p className="text-muted-foreground">{t('description')}</p>
        <Link
          href="/keepsakes/new"
          className="inline-block bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 py-3 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md"
        >
          {t('cta')}
        </Link>
      </div>
    </div>
  );
}

function KeepsakeRow({
  keepsake,
  onClick,
  isLoading,
}: {
  keepsake: KeepsakeSummary;
  onClick: () => void;
  isLoading: boolean;
}) {
  const t = useTranslations('keepsakes');

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="block w-full text-left bg-card rounded-2xl border border-border/50 shadow-soft p-6 transition-shadow duration-200 ease-out hover:shadow-soft-md disabled:opacity-70"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <KeepsakeTypeIcon type={keepsake.type} className="w-6 h-6 text-icon-line" />
          <div>
            <h3 className="font-medium text-foreground">{keepsake.title}</h3>
            <p className="text-sm text-muted-foreground">
              {t(`types.${keepsake.type as KeepsakeType}`)} ·{' '}
              {t('card.updatedAt', { date: formatDate(keepsake.updatedAt) })}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-icon-line" />
      </div>
    </button>
  );
}
