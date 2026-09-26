import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Button — the single button primitive used everywhere.               */
/* ------------------------------------------------------------------ */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-violet to-accent text-white shadow-glow hover:brightness-110 hover:shadow-glow-lg border border-white/10',
  secondary: 'glass text-ink hover:bg-white/[0.08] hover:border-line-strong',
  ghost: 'text-ink-dim hover:text-ink hover:bg-white/[0.06] border border-transparent',
  danger: 'bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20',
  outline: 'border border-line-strong text-ink hover:border-accent/60 hover:text-white bg-transparent',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  /** renders as a react-router Link */
  to?: string;
  /** renders as an anchor */
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, to, href, className, children, disabled, ...rest },
  ref
) {
  const classes = cn(
    'inline-flex select-none items-center justify-center font-medium transition-all duration-200 ease-out-expo',
    'focus-visible:outline-2 focus-visible:outline-accent-soft disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
    VARIANTS[variant],
    SIZES[size],
    className
  );
  const content = (
    <>
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : icon}
      {children}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
});
