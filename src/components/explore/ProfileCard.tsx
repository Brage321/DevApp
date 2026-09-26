import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Surfaces';
import { BadgeRow } from '@/components/ui/Badge';
import type { PublicProfileSummary } from '@/types';
import { formatNumber, timeAgo } from '@/lib/utils';

/** Single profile card used in Explore grids. */
export function ProfileCard({ profile: p }: { profile: PublicProfileSummary }) {
  return (
    <Link
      to={`/${p.username}`}
      className="card-hover group block overflow-hidden rounded-2xl border border-line focus-visible:outline-accent-soft"
      aria-label={`Open @${p.username}'s profile`}
    >
      <div className="relative h-24" style={{ background: p.backgroundCss }}>
        <div className="noise absolute inset-0 opacity-[0.08]" />
        {p.featured && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            ★ Featured
          </span>
        )}
        <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] text-white/80 backdrop-blur">
          {formatNumber(p.views)} views
        </span>
      </div>
      <div className="bg-bg1/80 p-4">
        <div className="-mt-9 mb-3">
          <Avatar
            name={p.displayName}
            src={p.avatarUrl || undefined}
            accent={p.accent}
            size={48}
            className="border-2 border-bg1"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="truncate font-display text-sm font-semibold text-white">{p.displayName}</span>
          <BadgeRow badges={p.badges} size="sm" />
        </div>
        <span className="text-xs text-ink-faint">@{p.username}</span>
        <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-relaxed text-ink-dim">{p.bio}</p>
        <span className="mt-1 block text-[11px] text-ink-faint">joined {timeAgo(p.createdAt)}</span>
      </div>
    </Link>
  );
}
