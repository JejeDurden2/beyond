'use client';

export function DashboardSkeleton(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {/* Welcome Card - 2 cols */}
      <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 shadow-soft p-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>

      {/* Keepsake Stats Card */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-10 w-12 bg-muted rounded" />
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        </div>
      </div>

      {/* Beneficiary Stats Card */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-10 w-12 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
      </div>

      {/* Recent Keepsakes - full width */}
      <div className="lg:col-span-4 bg-card rounded-2xl border border-border/50 shadow-soft p-6 animate-pulse">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-36 bg-muted rounded" />
            <div className="h-9 w-24 bg-muted rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted rounded-2xl h-48" />
            ))}
          </div>
        </div>
      </div>

      {/* Trusted Person Card */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="h-5 w-24 bg-muted rounded" />
          </div>
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
      </div>

      {/* Quick Actions - 3 cols */}
      <div className="lg:col-span-3 bg-card rounded-2xl border border-border/50 shadow-soft p-6 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-14 bg-muted rounded-xl" />
          <div className="flex-1 h-14 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}
