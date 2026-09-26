import { BADGES } from '@/lib/config';
import type { BadgeId } from '@/types';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Profile badges (Verified, Early User, Supporter, Developer,         */
/* Creator, Premium, OG) — colored pills with tooltip labels.          */
/* ------------------------------------------------------------------ */

export function ProfileBadge({ id, size = 'md' }: { id: BadgeId; size?: 'sm' | 'md' }) {
  const meta = BADGES[id];
  if (!meta) return null;
  return (
    <span
      title={meta.label}
      aria-label={meta.label}
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-semibold',
        size === 'sm' ? 'h-4.5 w-4.5 text-[10px]' : 'h-5 w-5 text-[11px]'
      )}
      style={{
        color: meta.color,
        borderColor: `${meta.color}55`,
        background: `${meta.color}14`,
      }}
    >
      {meta.emoji}
    </span>
  );
}

export function BadgeRow({ badges, size = 'md' }: { badges: BadgeId[]; size?: 'sm' | 'md' }) {
  if (!badges.length) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      {badges.map((b) => (
        <ProfileBadge key={b} id={b} size={size} />
      ))}
    </span>
  );
}
