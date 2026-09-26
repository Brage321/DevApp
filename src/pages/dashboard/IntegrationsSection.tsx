import { MessageCircle, Globe2, Users, Info } from 'lucide-react';
import { Card } from '@/components/ui/Surfaces';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Inputs';
import { useAuth } from '@/hooks/useAuth';

/** Dashboard → Integrations: Discord, custom domains, follow system. */
export default function IntegrationsSection() {
  const { isDemo } = useAuth();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-white">Integrations</h1>
        <p className="mt-1 text-sm text-ink-dim">Extend your profile with connected services.</p>
      </header>

      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5865F2]/15 text-[#8B9AFF]">
              <MessageCircle size={18} />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-white">Discord</h2>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-ink-dim">
                Show your Discord avatar, status and activity on your profile. Connection uses the
                Discord OAuth flow, which requires client credentials to be held server-side
                (Supabase Edge Function) — they are never shipped to the browser.
              </p>
            </div>
          </div>
          <Tooltip label="Requires Discord OAuth setup — see README">
            <Button variant="secondary" size="sm" disabled>
              Connect
            </Button>
          </Tooltip>
        </div>
        <p className="rounded-xl border border-line bg-white/[0.02] px-3.5 py-2.5 text-[11px] text-ink-faint">
          Status: <span className="text-ink-dim">interface ready — OAuth backend is a documented next step</span>
        </p>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-soft">
            <Globe2 size={18} />
          </div>
          <div>
            <h2 className="font-display text-sm font-semibold text-white">Custom domains</h2>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-ink-dim">
              Point username.com at your Kloa.lol profile. The profile model and backend already
              support domain mapping; DNS verification and issuance are planned for a future
              release.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            disabled
            placeholder="yourdomain.com"
            className="input-base w-56 opacity-50"
            aria-label="Custom domain (coming soon)"
          />
          <Button variant="secondary" size="sm" disabled>
            Verify domain
          </Button>
          <span className="text-[11px] text-ink-faint">coming soon</span>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Users size={18} />
          </div>
          <div>
            <h2 className="font-display text-sm font-semibold text-white">Follow system</h2>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-ink-dim">
              Follow creators and build a timeline. The data model reserves social graph support so
              this can ship without breaking changes.
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-ink-faint">
              <Info size={11} /> planned — not available yet
            </p>
          </div>
        </div>
      </Card>

      {isDemo && (
        <p className="text-[11px] text-ink-faint">
          Integrations requiring server credentials are disabled in demo mode.
        </p>
      )}
    </div>
  );
}
