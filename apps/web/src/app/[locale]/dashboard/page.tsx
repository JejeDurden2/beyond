'use client';

import { useRouter } from '@/i18n/navigation';
import { useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout';
import {
  KeepsakeVisualization,
  useKeepsakeVisualization,
} from '@/components/features/visualizations';
import {
  WelcomeCard,
  KeepsakeStatsCard,
  BeneficiaryStatsCard,
  RecentKeepsakesCard,
  TrustedPersonCard,
  QuickActionsCard,
  DashboardSkeleton,
} from '@/components/features/dashboard';
import { getKeepsakes, getKeepsake } from '@/lib/api/keepsakes';
import { getBeneficiaries } from '@/lib/api/beneficiaries';
import type { KeepsakeSummary, Keepsake, Beneficiary } from '@/types';

export default function DashboardPage(): React.ReactElement {
  const router = useRouter();
  const { isTextBased } = useKeepsakeVisualization();

  const [keepsakes, setKeepsakes] = useState<KeepsakeSummary[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Visualization state
  const [selectedKeepsake, setSelectedKeepsake] = useState<Keepsake | null>(null);

  useEffect(() => {
    async function loadData(): Promise<void> {
      try {
        const [keepsakeData, beneficiaryData] = await Promise.all([
          getKeepsakes(),
          getBeneficiaries(),
        ]);
        setKeepsakes(keepsakeData.keepsakes);
        setBeneficiaries(beneficiaryData.beneficiaries);
      } catch {
        // Silent fail - empty state will be shown
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleKeepsakeClick = useCallback(
    async (keepsake: KeepsakeSummary): Promise<void> => {
      // For non-text keepsakes, go directly to edit page
      if (!isTextBased(keepsake.type)) {
        router.push(`/keepsakes/${keepsake.id}`);
        return;
      }

      // For text-based keepsakes, load full content and show visualization
      try {
        const fullKeepsake = await getKeepsake(keepsake.id);
        setSelectedKeepsake(fullKeepsake);
      } catch {
        // On error, fallback to edit page
        router.push(`/keepsakes/${keepsake.id}`);
      }
    },
    [isTextBased, router],
  );

  const handleCloseVisualization = useCallback((): void => {
    setSelectedKeepsake(null);
  }, []);

  const handleEditFromVisualization = useCallback((): void => {
    if (selectedKeepsake) {
      router.push(`/keepsakes/${selectedKeepsake.id}`);
    }
  }, [selectedKeepsake, router]);

  return (
    <AppShell requireAuth>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Row 1: Welcome + Stats */}
            <WelcomeCard />
            <KeepsakeStatsCard keepsakes={keepsakes} />
            <BeneficiaryStatsCard beneficiaries={beneficiaries} />

            {/* Row 2: Recent Keepsakes (full width) */}
            <RecentKeepsakesCard keepsakes={keepsakes} onKeepsakeClick={handleKeepsakeClick} />

            {/* Row 3: Trusted Person + Quick Actions */}
            <TrustedPersonCard beneficiaries={beneficiaries} />
            <QuickActionsCard />
          </div>
        )}
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
