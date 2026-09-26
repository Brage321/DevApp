import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Ghost } from 'lucide-react';
import { ProfileView } from '@/components/profile/ProfileView';
import { IntroScreen } from '@/components/profile/IntroScreen';
import { ReportModal } from '@/components/profile/ReportModal';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { getBackend } from '@/services/backend';
import type { Profile } from '@/types';
import { RESERVED_USERNAMES } from '@/lib/config';
import { normalizeUsername } from '@/lib/security';

/* ------------------------------------------------------------------ */
/* Public profile — kloa.lol/:username                                 */
/* The username comes from the URL (SPA fallback serves the app for    */
/* every path); visibility is enforced by the backend/database.        */
/* ------------------------------------------------------------------ */

type State =
  | { status: 'loading' }
  | { status: 'ready'; profile: Profile }
  | { status: 'notfound' }
  | { status: 'error' };

export default function ProfilePage() {
  const { username = '' } = useParams();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    const clean = normalizeUsername(username);
    if (RESERVED_USERNAMES.includes(clean)) {
      setState({ status: 'notfound' });
      return;
    }

    const backend = getBackend();
    void backend.profiles
      .getByUsername(clean)
      .then((p) => {
        if (cancelled) return;
        setState(p ? { status: 'ready', profile: p } : { status: 'notfound' });
        if (p) void backend.analytics.recordView(clean).catch(() => undefined);
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  const handleLinkClick = useCallback(
    (link: { id: string; title: string }) => {
      void getBackend()
        .analytics.recordClick(normalizeUsername(username), link.id, link.title)
        .catch(() => undefined);
    },
    [username]
  );

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg0" role="status" aria-label="Loading profile">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-accent" />
          <p className="text-sm text-ink-faint">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <ProfileMessage
        title="Unable to load profile"
        message="Something went wrong. Please try again."
      />
    );
  }

  if (state.status === 'notfound') {
    return (
      <ProfileMessage
        title="Profile not found"
        message={`kloa.lol/${username} doesn't exist — or it's private.`}
        cta
      />
    );
  }

  const { profile } = state;
  const title = profile.displayName ? `${profile.displayName} (@${profile.username})` : `@${profile.username}`;

  return (
    <div className="relative min-h-screen bg-bg0">
      {profile.intro.enabled && !profile.intro.text ? null : profile.intro.enabled ? (
        <IntroScreen intro={profile.intro} />
      ) : null}
      <ProfileView
        profile={profile}
        onLinkClick={handleLinkClick}
        onReport={() => setReportOpen(true)}
        className="min-h-screen"
      />
      {/* floating brand mark (bottom-left, non-intrusive) */}
      <div className="fixed bottom-4 left-4 z-20 opacity-40 transition-opacity duration-300 hover:opacity-90">
        <Logo />
      </div>
      <ReportModal username={profile.username} open={reportOpen} onClose={() => setReportOpen(false)} />
      <Meta profile={{ username: profile.username, displayName: profile.displayName, bio: profile.bio }} title={title} />
    </div>
  );
}

function Meta({
  title,
  profile,
}: {
  title: string;
  profile: { username: string; displayName: string; bio: string };
}) {
  useDocumentMeta({
    title,
    description: profile.bio ? profile.bio.replace(/\n+/g, ' · ').slice(0, 160) : `See ${profile.username}'s Kloa.lol profile.`,
    path: `/${profile.username}`,
    image: profile.displayName ? undefined : undefined,
  });
  return null;
}

function ProfileMessage({
  title,
  message,
  cta,
}: {
  title: string;
  message: string;
  cta?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg0 px-4 text-center">
      <Logo />
      <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-bg2 text-ink-dim">
        <Ghost size={26} />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-white">{title}</h1>
      <p className="mt-3 max-w-sm text-ink-dim">{message}</p>
      {cta && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/register">Claim this username</Button>
          <Button to="/explore" variant="secondary">
            Explore profiles
          </Button>
        </div>
      )}
      <Link to="/" className="mt-10 text-xs text-ink-faint transition-colors hover:text-ink-dim">
        ← back to kloa.lol
      </Link>
    </div>
  );
}
