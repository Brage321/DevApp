import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';
import { AlertTriangle } from 'lucide-react';
import { isDemoMode } from '@/services/backend';

/** Centered card shell shared by all auth pages. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg0 px-4 py-12">
      <div
        className="absolute left-1/2 top-[-200px] h-[480px] w-[720px] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
        style={{ background: 'radial-gradient(closest-side, #7C5CFF, transparent)' }}
        aria-hidden
      />
      <div className="grid-pattern absolute inset-0 opacity-40" aria-hidden />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-line-strong bg-bg1/90 p-7 shadow-card backdrop-blur-xl">
          <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-dim">{subtitle}</p>
          {isDemoMode && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3.5 py-3 text-xs leading-relaxed text-amber-300">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>
                <strong>Demo mode:</strong> authentication is simulated in your browser. Configure
                Supabase keys for real accounts (see README).
              </span>
            </div>
          )}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-ink-dim">{footer}</div>}
        <p className="mt-10 text-center text-xs text-ink-faint">
          <Link to="/" className="transition-colors hover:text-ink-dim">
            ← back to kloa.lol
          </Link>
        </p>
      </div>
    </div>
  );
}
