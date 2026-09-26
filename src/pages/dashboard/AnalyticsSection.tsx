import { useEffect, useState } from 'react';
import { Eye, MousePointerClick, CalendarDays, Globe } from 'lucide-react';
import { useDashboard } from '@/components/dashboard/DashboardContext';
import { Card, Skeleton } from '@/components/ui/Surfaces';
import { AreaChart, Donut, BarList } from '@/components/ui/Charts';
import { getBackend, isDemoMode } from '@/services/backend';
import type { AnalyticsSummary } from '@/types';
import { formatNumber } from '@/lib/utils';

/** Dashboard → Analytics: views, clicks, devices, browsers, top links. */
export default function AnalyticsSection() {
  const { profile } = useDashboard();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    void getBackend()
      .analytics.getSummary(profile.username)
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-400">Unable to load analytics. Please try again later.</p>
      </Card>
    );
  }

  const stats = data
    ? [
        { icon: Eye, label: 'Views today', value: formatNumber(data.viewsToday) },
        { icon: CalendarDays, label: 'This week', value: formatNumber(data.viewsWeek) },
        { icon: CalendarDays, label: 'This month', value: formatNumber(data.viewsMonth) },
        { icon: MousePointerClick, label: 'Link clicks', value: formatNumber(data.clicksTotal) },
      ]
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-ink-dim">
          Privacy-friendly, aggregate data — no IPs, no fingerprints, no cross-site tracking.
          {isDemoMode && ' (Demo data seeded locally.)'}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.length
          ? stats.map((s) => (
              <Card key={s.label} className="p-4">
                <s.icon size={18} className="text-accent-soft" />
                <p className="mt-3 font-display text-2xl font-bold text-white">{s.value}</p>
                <p className="mt-0.5 text-xs text-ink-faint">{s.label}</p>
              </Card>
            ))
          : Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>

      <Card>
        <h2 className="font-display text-sm font-semibold text-white">Views — last 30 days</h2>
        <div className="mt-4">
          {data ? <AreaChart data={data.daily} accent={profile?.theme.accent} /> : <Skeleton className="h-44" />}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-sm font-semibold text-white">Devices</h2>
          <div className="mt-4">
            {data ? (
              <Donut items={Object.entries(data.devices).map(([label, value]) => ({ label, value }))} accent={profile?.theme.accent} />
            ) : (
              <Skeleton className="h-32" />
            )}
          </div>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-white">
            <Globe size={15} className="text-accent-soft" /> Browsers
          </h2>
          <div className="mt-4">
            {data ? (
              <BarList items={Object.entries(data.browsers).map(([label, value]) => ({ label, value }))} accent={profile?.theme.accent} />
            ) : (
              <Skeleton className="h-32" />
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-display text-sm font-semibold text-white">Top link clicks</h2>
        <div className="mt-4">
          {data ? (
            data.topLinks.length ? (
              <BarList
                items={data.topLinks.map((l) => ({ label: l.title, value: l.clicks }))}
                accent={profile?.theme.accent}
              />
            ) : (
              <p className="text-sm text-ink-faint">Add custom links to start collecting click data.</p>
            )
          ) : (
            <Skeleton className="h-24" />
          )}
        </div>
      </Card>
    </div>
  );
}
