import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Info, X, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn, uid } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Toast system — reusable notifications.                              */
/* ------------------------------------------------------------------ */

export type ToastKind = 'success' | 'error' | 'info' | 'loading';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  toast: (kind: ToastKind, message: string, duration?: number) => string;
  success: (message: string) => string;
  error: (message: string) => string;
  info: (message: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
  loading: Loader2,
};

const ACCENT: Record<ToastKind, string> = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-accent-soft',
  loading: 'text-accent-soft',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (kind: ToastKind, message: string, duration = kind === 'loading' ? 30000 : 3600) => {
      const id = uid();
      setToasts((list) => [...list.slice(-4), { id, kind, message }]);
      if (duration > 0 && kind !== 'loading') {
        timers.current.set(
          id,
          window.setTimeout(() => dismiss(id), duration)
        );
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (m) => toast('success', m),
      error: (m) => toast('error', m),
      info: (m) => toast('info', m),
      dismiss,
    }),
    [toast, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end"
        >
          <AnimatePresence>
            {toasts.map((t) => {
              const Icon = ICONS[t.kind];
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-line-strong',
                    'bg-bg2/95 px-4 py-3 shadow-card backdrop-blur-xl'
                  )}
                  role="status"
                >
                  <Icon
                    size={18}
                    className={cn('shrink-0', ACCENT[t.kind], t.kind === 'loading' && 'animate-spin')}
                  />
                  <p className="min-w-0 flex-1 text-sm text-ink">{t.message}</p>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="shrink-0 rounded-md p-1 text-ink-faint transition-colors hover:text-ink"
                    aria-label="Dismiss notification"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>.');
  return ctx;
}
