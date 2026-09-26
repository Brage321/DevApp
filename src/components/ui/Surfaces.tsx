import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { cn, hexToRgba, initials } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Surface & display primitives                                        */
/* ------------------------------------------------------------------ */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-bg1/80 p-5 transition-colors duration-300',
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && (
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-display-lg font-semibold text-white">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-ink-dim">{subtitle}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-ink-dim">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-dim">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            ref={ref}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={cn('w-full rounded-2xl border border-line-strong bg-bg1 p-6 shadow-card', maxWidth)}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-white/[0.06] hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-3.5 py-3 text-sm text-red-300">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** Avatar with gradient-initials fallback — no external asset required. */
export function Avatar({
  name,
  src,
  size = 44,
  className,
  accent = '#8B5CF6',
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
  accent?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={`${name}'s avatar`}
        width={size}
        height={size}
        loading="lazy"
        className={cn('shrink-0 rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        'flex shrink-0 select-none items-center justify-center rounded-full font-display font-semibold text-white',
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `radial-gradient(120% 120% at 20% 15%, ${hexToRgba(accent, 0.85)}, #14121f 75%)`,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)',
      }}
    >
      {initials(name)}
    </div>
  );
}
