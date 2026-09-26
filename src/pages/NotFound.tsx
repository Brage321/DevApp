import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

/* ------------------------------------------------------------------ */
/* 404 — this page doesn't exist.                                      */
/* ------------------------------------------------------------------ */

export default function NotFound() {
  useDocumentMeta({ title: 'Page not found', robots: 'noindex' });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg0 px-4 text-center">
      <div
        className="absolute left-1/2 top-1/2 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[110px]"
        style={{ background: 'radial-gradient(closest-side, #7C5CFF, transparent)' }}
        aria-hidden
      />
      <div className="relative">
        <Logo />
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-gradient mt-12 font-display text-[110px] font-bold leading-none sm:text-[150px]"
        >
          404
        </motion.p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-white">
          This page doesn't exist.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-ink-dim">
          The link may be broken, or the page may have moved. Luckily, there's plenty to discover.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button to="/" icon={<Home size={16} />}>
            Go Home
          </Button>
          <Button to="/explore" variant="secondary" icon={<Compass size={16} />}>
            Explore Profiles
          </Button>
        </div>
        <Link to="/" className="mt-12 inline-block text-xs text-ink-faint transition-colors hover:text-ink-dim">
          kloa.lol — your identity. your page.
        </Link>
      </div>
    </div>
  );
}
