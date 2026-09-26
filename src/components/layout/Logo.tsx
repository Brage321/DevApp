import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Kloa.lol mark + wordmark. */
export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2.5', className)} aria-label="Kloa.lol home">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/10 bg-bg1 shadow-glow transition-transform duration-300 group-hover:scale-105">
        <svg viewBox="0 0 64 64" className="h-4.5 w-4.5" width="18" height="18" aria-hidden>
          <defs>
            <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7C5CFF" />
              <stop offset="0.55" stopColor="#A855F7" />
              <stop offset="1" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <path d="M20 14v36" stroke="url(#logo-g)" strokeWidth="7" strokeLinecap="round" />
          <path
            d="M46 14 24 33l22 17"
            stroke="url(#logo-g)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-[17px] font-semibold tracking-tight text-white">
          kloa<span className="text-accent-soft">.lol</span>
        </span>
      )}
    </Link>
  );
}
