import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { IntroConfig } from '@/types';
import { useReducedMotion } from '@/hooks/useMediaQuery';

/* ------------------------------------------------------------------ */
/* IntroScreen — optional branded splash that fades into the profile.  */
/* Respects prefers-reduced-motion (renders briefly without animation).*/
/* ------------------------------------------------------------------ */

export function IntroScreen({ intro }: { intro: IntroConfig }) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), reduced ? 400 : intro.duration);
    return () => window.clearTimeout(t);
  }, [intro.duration, reduced]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center"
          style={{ background: intro.background }}
          initial={{ opacity: 1 }}
          exit={{ opacity: intro.fade ? 0 : 1, filter: intro.blur ? 'blur(14px)' : undefined }}
          transition={{ duration: reduced ? 0.2 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden={false}
          role="status"
        >
          <motion.span
            className="font-display text-2xl font-semibold tracking-[0.35em] text-white/90 uppercase"
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.35em' }}
            transition={{ duration: reduced ? 0.2 : 0.9, ease: 'easeOut' }}
          >
            {intro.text || 'kloa.lol'}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
