import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home, UserRound, Paintbrush, Link2, Music, Wand2, Palette, BarChart3,
  Blocks, Settings, LogOut, ExternalLink, Menu, Eye,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useUnsavedGuard } from '@/hooks/useUnsavedGuard';
import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardContext';
import { ProfileView } from '@/components/profile/ProfileView';
import { Skeleton } from '@/components/ui/Surfaces';
import { isDemoMode } from '@/services/backend';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* DashboardLayout — professional SaaS shell:                          */
/*   desktop: sidebar | editor (Outlet) | live preview                 */
/*   mobile:  top bar, Editor/Preview toggle                           */
/* ------------------------------------------------------------------ */

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: Home, end: true },
  { to: '/dashboard/profile', label: 'Profile', icon: UserRound },
  { to: '/dashboard/appearance', label: 'Appearance', icon: Paintbrush },
  { to: '/dashboard/links', label: 'Links', icon: Link2 },
  { to: '/dashboard/music', label: 'Music', icon: Music },
  { to: '/dashboard/effects', label: 'Effects', icon: Wand2 },
  { to: '/dashboard/themes', label: 'Themes', icon: Palette },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/integrations', label: 'Integrations', icon: Blocks },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg0">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-accent" />
      </div>
    );
  }

  return (
    <DashboardProvider>
      <Shell user={user} onSignOut={() => void signOut().then(() => navigate('/', { replace: true }))} />
    </DashboardProvider>
  );
}

function Shell({
  user,
  onSignOut,
}: {
  user: { username: string; email: string; isAdmin: boolean };
  onSignOut: () => void;
}) {
  const { profile, loading, dirty } = useDashboard();
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useUnsavedGuard(dirty);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3" aria-label="Dashboard">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]'
                  : 'text-ink-dim hover:bg-white/[0.04] hover:text-ink'
              )
            }
          >
            <n.icon size={17} className="shrink-0" />
            {n.label}
          </NavLink>
        ))}
        {user.isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive ? 'bg-white/[0.08] text-white' : 'text-ink-dim hover:bg-white/[0.04] hover:text-ink'
              )
            }
          >
            <Eye size={17} className="shrink-0" />
            Admin
          </NavLink>
        )}
      </nav>
      <div className="border-t border-line p-4">
        {isDemoMode && (
          <p className="mb-3 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-2.5 py-2 text-[11px] leading-relaxed text-amber-300">
            <strong>Demo mode</strong> — data is stored locally in your browser.
          </p>
        )}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet to-azure text-xs font-bold text-white">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">@{user.username}</p>
            <p className="truncate text-[11px] text-ink-faint">{user.email}</p>
          </div>
          <button
            onClick={onSignOut}
            aria-label="Log out"
            className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-white/[0.06] hover:text-ink"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  const preview = (
    <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-black/40">
      {loading || !profile ? (
        <div className="space-y-4 p-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="h-full w-full overflow-y-auto">
          <ProfileView profile={profile} />
        </div>
      )}
      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
        Live preview
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-bg0">
      <aside className="hidden w-60 shrink-0 border-r border-line bg-bg1/60 lg:block">{sidebar}</aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-60 border-r border-line bg-bg1 lg:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-bg1/40 px-4">
          <button
            className="rounded-lg p-2 text-ink-dim hover:bg-white/[0.06] hover:text-ink lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <Button to={`/${profile?.username ?? ''}`} variant="ghost" size="sm" icon={<ExternalLink size={14} />}>
              View profile
            </Button>
            <SaveButton />
          </div>
        </header>

        {/* mobile editor/preview toggle */}
        <div className="flex gap-1 border-b border-line bg-bg1/40 px-4 py-2 lg:hidden">
          {(['editor', 'preview'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMobileTab(t)}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-[13px] font-medium capitalize transition-colors',
                mobileTab === t ? 'bg-white/[0.09] text-white' : 'text-ink-dim'
              )}
            >
              {t === 'preview' ? 'Preview' : 'Editor'}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1">
          <main
            className={cn(
              'min-w-0 flex-1 overflow-y-auto p-4 sm:p-6',
              mobileTab === 'preview' && 'hidden lg:block'
            )}
          >
            <Outlet />
          </main>
          <aside className={cn('w-[440px] shrink-0 p-4 xl:p-5', mobileTab === 'editor' && 'hidden lg:block')}>
            {preview}
          </aside>
        </div>
      </div>
    </div>
  );
}

function SaveButton() {
  const { dirty, save, saveState, revert } = useDashboard();
  const label =
    saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : dirty ? 'Save changes' : 'Saved';
  return (
    <div className="flex items-center gap-1.5">
      {dirty && saveState !== 'saving' && (
        <Button variant="ghost" size="sm" onClick={revert}>
          Revert
        </Button>
      )}
      <Button
        size="sm"
        loading={saveState === 'saving'}
        disabled={!dirty && saveState !== 'error'}
        onClick={() => void save()}
      >
        {label}
      </Button>
    </div>
  );
}
