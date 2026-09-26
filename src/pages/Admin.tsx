import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, Flag, Ban, Search, ChevronLeft, ChevronRight, BarChart3, BadgeCheck,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Card, EmptyState, Skeleton } from '@/components/ui/Surfaces';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Inputs';
import { Tabs } from '@/components/ui/ColorPicker';
import { BadgeRow } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { getBackend } from '@/services/backend';
import { BADGES } from '@/lib/config';
import type { AdminUserRow, BadgeId, ReportItem, SystemStats } from '@/types';
import { formatNumber, timeAgo } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Admin — /admin                                                      */
/* Authorization is enforced server-side (is_admin RPC / RLS in        */
/* production; demo admin account in demo mode). Hiding this page in   */
/* the UI is a courtesy, NOT the security boundary.                    */
/* ------------------------------------------------------------------ */

export default function Admin() {
  useDocumentMeta({ title: 'Admin', robots: 'noindex' });
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    void getBackend()
      .admin.isAdmin()
      .then((ok) => setIsAdmin(ok))
      .catch(() => setIsAdmin(false));
  }, [user, loading, navigate]);

  if (loading || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg0">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-accent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg0 px-4 text-center">
        <Logo />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-bg2">
          <ShieldCheck size={26} className="text-ink-dim" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Access denied</h1>
          <p className="mt-2 text-sm text-ink-dim">You don't have admin permissions.</p>
        </div>
        <Button to="/dashboard" variant="secondary">
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg0">
      <header className="border-b border-line bg-bg1/50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent-soft">
              Admin
            </span>
          </div>
          <Button to="/dashboard" variant="ghost" size="sm">
            Dashboard
          </Button>
        </div>
      </header>
      <AdminPanels />
    </div>
  );
}

function AdminPanels() {
  const [tab, setTab] = useState('users');

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Tabs
        tabs={[
          { id: 'users', label: 'Users' },
          { id: 'reports', label: 'Reports' },
          { id: 'stats', label: 'System' },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-6 max-w-sm"
      />
      {tab === 'users' && <UsersPanel />}
      {tab === 'reports' && <ReportsPanel />}
      {tab === 'stats' && <StatsPanel />}
    </main>
  );
}

function UsersPanel() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: AdminUserRow[]; hasMore: boolean; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [banned, setBanned] = useState<string[]>([]);
  const [banInput, setBanInput] = useState('');

  const load = useCallback(
    (q: string, p: number) => {
      setLoading(true);
      void getBackend()
        .admin.listUsers(q, p)
        .then(setData)
        .catch(() => toast.error('Unable to load users.'))
        .finally(() => setLoading(false));
    },
    [toast]
  );

  useEffect(() => {
    load(search, page);
  }, [search, page, load]);

  useEffect(() => {
    void getBackend()
      .admin.listBanned()
      .then(setBanned)
      .catch(() => undefined);
  }, []);

  const act = async (fn: () => Promise<void>, msg: string) => {
    try {
      await fn();
      toast.success(msg);
      load(search, page);
    } catch {
      toast.error('Action failed.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-white">
          <Ban size={15} className="text-red-400" /> Ban a username
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <Input
            value={banInput}
            onChange={(e) => setBanInput(e.target.value.toLowerCase())}
            placeholder="username"
            className="w-48"
            aria-label="Username to ban"
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (!banInput) return;
              void act(() => getBackend().admin.banUsername(banInput), `Banned "${banInput}".`).then(() =>
                setBanInput('')
              );
            }}
          >
            Ban
          </Button>
        </div>
        {banned.length > 0 && (
          <p className="text-xs text-ink-faint">
            Banned: <span className="text-ink-dim">{banned.join(', ')}</span>
          </p>
        )}
      </Card>

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search users…"
            className="pl-10"
            aria-label="Search users"
          />
        </div>
        <span className="text-xs text-ink-faint">{data ? `${data.total} users` : ''}</span>
      </div>

      {loading && !data ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : data && data.items.length === 0 ? (
        <EmptyState icon={<Users size={20} />} title="No users found" />
      ) : (
        <div className="space-y-3">
          {data?.items.map((u) => (
            <UserCard key={u.id} user={u} act={act} />
          ))}
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="sm" disabled={page === 1} icon={<ChevronLeft size={14} />} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span className="text-xs text-ink-faint">page {page}</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={!data.hasMore}
            icon={<ChevronRight size={14} />}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function UserCard({
  user: u,
  act,
}: {
  user: AdminUserRow;
  act: (fn: () => Promise<void>, msg: string) => Promise<void>;
}) {
  return (
    <Card className="flex flex-wrap items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-sm font-semibold text-white">@{u.username}</span>
          <BadgeRow badges={u.badges} size="sm" />
          {u.suspended && (
            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-300">
              suspended
            </span>
          )}
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-ink-faint">{u.visibility}</span>
        </div>
        <p className="mt-1 truncate text-xs text-ink-faint">
          {u.email} · {formatNumber(u.views)} views · joined {timeAgo(u.createdAt)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          className="w-32"
          aria-label="Grant badge"
          value=""
          onChange={(e) => {
            const b = e.target.value as BadgeId;
            if (b) void act(() => getBackend().admin.grantBadge(u.id, b), `Granted ${BADGES[b].label}.`);
          }}
          options={[
            { value: '', label: '+ badge…' },
            ...Object.entries(BADGES).map(([id, m]) => ({ value: id, label: m.label })),
          ]}
        />
        {u.badges.length > 0 && (
          <Select
            className="w-32"
            aria-label="Revoke badge"
            value=""
            onChange={(e) => {
              const b = e.target.value as BadgeId;
              if (b) void act(() => getBackend().admin.revokeBadge(u.id, b), 'Badge revoked.');
            }}
            options={[
              { value: '', label: '− badge…' },
              ...u.badges.map((b) => ({ value: b, label: BADGES[b]?.label ?? b })),
            ]}
          />
        )}
        <Button
          size="sm"
          variant={u.suspended ? 'secondary' : 'ghost'}
          onClick={() =>
            void act(
              () => getBackend().admin.setSuspended(u.id, !u.suspended),
              u.suspended ? 'User restored.' : 'User suspended.'
            )
          }
        >
          {u.suspended ? 'Unsuspend' : 'Suspend'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => void act(() => getBackend().admin.setFeatured(u.username, true), 'Featured.')}>
          Feature
        </Button>
        <Button size="sm" variant="ghost" onClick={() => void act(() => getBackend().admin.setFeatured(u.username, false), 'Unfeatured.')}>
          Unfeature
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => {
            if (window.confirm(`Delete @${u.username} and their profile? This cannot be undone.`)) {
              void act(() => getBackend().admin.deleteUser(u.id), 'User deleted.');
            }
          }}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}

function ReportsPanel() {
  const toast = useToast();
  const [reports, setReports] = useState<ReportItem[] | null>(null);

  useEffect(() => {
    void getBackend()
      .admin.listReports()
      .then(setReports)
      .catch(() => toast.error('Unable to load reports.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolve = async (id: string, outcome: 'dismiss' | 'actioned') => {
    try {
      await getBackend().admin.resolveReport(id, outcome);
      setReports((prev) => (prev ?? []).map((r) => (r.id === id ? { ...r, status: 'resolved' as const } : r)));
      toast.success(outcome === 'actioned' ? 'Marked as actioned.' : 'Report dismissed.');
    } catch {
      toast.error('Action failed.');
    }
  };

  if (!reports) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }
  if (reports.length === 0) {
    return <EmptyState icon={<Flag size={20} />} title="No reports" description="Nothing to moderate. Enjoy the quiet." />;
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <Card key={r.id} className="flex flex-wrap items-start gap-4 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-sm font-semibold text-white">@{r.username}</span>
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                {r.reason}
              </span>
              {r.status === 'resolved' && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  resolved
                </span>
              )}
            </div>
            {r.details && <p className="mt-1.5 text-xs leading-relaxed text-ink-dim">{r.details}</p>}
            <p className="mt-1 text-[11px] text-ink-faint">{timeAgo(r.createdAt)}</p>
          </div>
          {r.status === 'open' && (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => void resolve(r.id, 'dismiss')}>
                Dismiss
              </Button>
              <Button size="sm" variant="danger" onClick={() => void resolve(r.id, 'actioned')}>
                Actioned
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function StatsPanel() {
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    void getBackend()
      .admin.getStats()
      .then(setStats)
      .catch(() => undefined);
  }, []);

  const cards = stats
    ? [
        { label: 'Total users', value: formatNumber(stats.totalUsers) },
        { label: 'Profiles', value: formatNumber(stats.totalProfiles) },
        { label: 'Total views', value: formatNumber(stats.totalViews) },
        { label: 'Link clicks', value: formatNumber(stats.totalClicks) },
        { label: 'Open reports', value: String(stats.openReports) },
      ]
    : [];

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-white">
        <BarChart3 size={15} className="text-accent-soft" /> System statistics
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.length
          ? cards.map((c) => (
              <Card key={c.label} className="p-4">
                <p className="font-display text-2xl font-bold text-white">{c.value}</p>
                <p className="mt-1 text-xs text-ink-faint">{c.label}</p>
              </Card>
            ))
          : Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-faint">
        <BadgeCheck size={12} className="text-accent-soft" />
        In production, admin authorization is enforced server-side via the is_admin() RPC and RLS.
      </p>
    </div>
  );
}
