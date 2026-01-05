'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout';
import { useAuth } from '@/hooks/use-auth';
import { getKeepsakes } from '@/lib/api/keepsakes';
import type { KeepsakeSummary } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [keepsakes, setKeepsakes] = useState<KeepsakeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKeepsakes();
        setKeepsakes(data.keepsakes);
      } catch (error) {
        console.error('Failed to load keepsakes:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppShell requireAuth>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-2 mb-12">
          <h1 className="font-display text-display-sm text-foreground">
            {getGreeting()}{user?.email ? `, ${user.email.split('@')[0]}` : ''}.
          </h1>
          <p className="text-lg text-muted-foreground">
            Your vault is secure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <StatCard
            title="Vault Status"
            value="Active"
            subtitle="Your vault is protected"
            icon={
              <div className="w-3 h-3 rounded-full bg-green-500" />
            }
          />
          <StatCard
            title="Keepsakes"
            value={isLoading ? '...' : keepsakes.length.toString()}
            subtitle={keepsakes.length === 1 ? 'item preserved' : 'items preserved'}
            linkTo="/keepsakes"
            linkLabel="View all"
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Recent Keepsakes</h2>
            <Link
              href="/keepsakes/new"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-5 py-2.5 text-sm font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md"
            >
              + New Keepsake
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl border border-border/50 p-6 animate-pulse">
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
                <KeepsakeRow key={keepsake.id} keepsake={keepsake} />
              ))}
            </div>
          )}
        </div>
      </div>
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
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-12 text-center">
      <div className="max-w-sm mx-auto space-y-4">
        <div className="w-16 h-16 mx-auto bg-muted rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="font-display text-xl text-foreground">Create your first keepsake</h3>
        <p className="text-muted-foreground">
          Preserve a message, memory, or wish for your loved ones.
        </p>
        <Link
          href="/keepsakes/new"
          className="inline-block bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 py-3 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md"
        >
          Create Keepsake
        </Link>
      </div>
    </div>
  );
}

const typeIcons: Record<string, string> = {
  text: '📝',
  letter: '✉️',
  photo: '📷',
  video: '🎬',
  wish: '⭐',
  scheduled_action: '📅',
};

const typeLabels: Record<string, string> = {
  text: 'Text',
  letter: 'Letter',
  photo: 'Photo',
  video: 'Video',
  wish: 'Wish',
  scheduled_action: 'Scheduled Action',
};

function KeepsakeRow({ keepsake }: { keepsake: KeepsakeSummary }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <Link
      href={`/keepsakes/${keepsake.id}`}
      className="block bg-card rounded-2xl border border-border/50 shadow-soft p-6 transition-shadow duration-200 ease-out hover:shadow-soft-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-2xl">{typeIcons[keepsake.type] || '📄'}</span>
          <div>
            <h3 className="font-medium text-foreground">{keepsake.title}</h3>
            <p className="text-sm text-muted-foreground">
              {typeLabels[keepsake.type] || keepsake.type} · Updated {formatDate(keepsake.updatedAt)}
            </p>
          </div>
        </div>
        <span className="text-muted-foreground">→</span>
      </div>
    </Link>
  );
}
