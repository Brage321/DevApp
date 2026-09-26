import { copyText, formatNumber, formatDate } from '@/lib/utils';
import { useDashboard } from '@/components/dashboard/DashboardContext';
import { useToast } from '@/hooks/useToast';
import { Card } from '@/components/ui/Surfaces';
import { Button } from '@/components/ui/Button';
import { Eye, MousePointerClick, Link2, Users, Copy, ExternalLink, Paintbrush } from 'lucide-react';

/** Dashboard → Overview: at-a-glance stats + quick actions. */
export default function Overview() {
  const { profile } = useDashboard();
  const toast = useToast();

  if (!profile) return null;
  const url = `${window.location.origin}/${profile.username}`;

  const stats = [
    { icon: Eye, label: 'Profile views', value: formatNumber(profile.views) },
    { icon: Link2, label: 'Custom links', value: String(profile.links.filter((l) => !l.hidden).length) },
    { icon: Users, label: 'Social links', value: String(profile.socials.filter((s) => !s.hidden).length) },
    { icon: MousePointerClick, label: 'Member since', value: formatDate(profile.createdAt) },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-white">
          Hey, {profile.displayName || profile.username} 👋
        </h1>
        <p className="mt-1 text-sm text-ink-dim">Here's how your page is doing.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon size={18} className="text-accent-soft" />
            <p className="mt-3 font-display text-2xl font-bold text-white">{s.value}</p>
            <p className="mt-0.5 text-xs text-ink-faint">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-display text-sm font-semibold text-white">Your profile address</h2>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 truncate rounded-xl border border-line bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink">
            {url.replace(/^https?:\/\//, '')}
          </code>
          <Button
            variant="secondary"
            size="sm"
            icon={<Copy size={14} />}
            onClick={() => void copyText(url).then((ok) => ok && toast.success('Copied.'))}
          >
            Copy
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<ExternalLink size={14} />}
            to={`/${profile.username}`}
          >
            Open
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-sm font-semibold text-white">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button to="/dashboard/appearance" variant="secondary" size="sm" icon={<Paintbrush size={14} />}>
            Customize appearance
          </Button>
          <Button to="/dashboard/links" variant="secondary" size="sm" icon={<Link2 size={14} />}>
            Manage links
          </Button>
          <Button to="/dashboard/analytics" variant="secondary" size="sm" icon={<Eye size={14} />}>
            View analytics
          </Button>
        </div>
        <p className="mt-4 text-xs text-ink-faint">
          Tip: your live preview updates instantly as you edit — changes only go live after{' '}
          <span className="text-ink-dim">Save changes</span>.
        </p>
      </Card>
    </div>
  );
}
