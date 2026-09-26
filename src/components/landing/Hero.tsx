import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProfileView } from '@/components/profile/ProfileView';
import { showcaseProfiles } from '@/lib/demoSeed';
import { useReducedMotion } from '@/hooks/useMediaQuery';

export function Hero() {
  const reduced = useReducedMotion();
  const previewProfile = showcaseProfiles()[0];

  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pt-40" aria-label="Hero">
      <div className="grid-pattern absolute inset-0 opacity-60" aria-hidden />
      <div
        className="absolute left-1/2 top-[-220px] h-[560px] w-[860px] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
        style={{ background: 'radial-gradient(closest-side, #7C5CFF, #A855F7 55%, transparent)' }}
        aria-hidden
      />
      <div className="noise absolute inset-0 opacity-[0.05]" aria-hidden />

      {!reduced && (
        <>
          <div className="animate-float-slow absolute left-[8%] top-[22%] h-16 w-16 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm" aria-hidden />
          <div className="animate-float absolute right-[10%] top-[16%] h-10 w-10 rounded-full border border-accent/30 bg-accent/10" aria-hidden />
          <div className="animate-float-slow absolute bottom-[18%] left-[16%] h-8 w-8 rotate-12 rounded-lg border border-line bg-bg2/60" aria-hidden style={{ animationDelay: '1.4s' }} />
          <div className="animate-float absolute bottom-[26%] right-[15%] h-12 w-12 rounded-xl border border-line bg-bg2/60 backdrop-blur-sm" aria-hidden style={{ animationDelay: '2.2s' }} />
        </>
      )}

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.04] px-3.5 py-1.5 text-[13px] text-ink-dim backdrop-blur"
          >
            <Sparkles size={14} className="text-accent-soft" />
            Open beta — take your handle before it’s gone
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-display-xl font-bold text-white"
          >
            Your links.
            <br />
            <span className="text-gradient">Your vibe.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-md text-lg leading-relaxed text-ink-dim"
          >
            Put your work, music, socials, and the bits that make you you in one place. Clean enough to keep up with. Personal enough to actually enjoy sharing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Button to="/register" size="lg" icon={<ArrowRight size={17} />}>
              Create your profile
            </Button>
            <Button to="/explore" variant="secondary" size="lg">
              Explore profiles
            </Button>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex gap-10"
          >
            {[
              ['One page', 'for everything'],
              ['Built to', 'feel personal'],
              ['Works on', 'your phone'],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-2xl font-semibold text-white">{v}</dd>
                <dd className="mt-0.5 text-xs text-ink-faint">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 34, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[420px]"
        >
          <div
            className="absolute -inset-8 rounded-[36px] opacity-40 blur-2xl"
            style={{ background: 'radial-gradient(closest-side, rgba(124,92,255,0.5), transparent)' }}
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-[28px] border border-line-strong shadow-card">
            <div className="flex items-center gap-1.5 border-b border-line bg-bg1/90 px-4 py-2.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="ml-3 truncate rounded-md bg-white/[0.05] px-2.5 py-1 text-[11px] text-ink-faint">
                kloa.lol/nova
              </span>
            </div>
            <div className="relative h-[560px] w-full bg-black">
              <div className="absolute inset-0 origin-top-left scale-[0.64] sm:scale-[0.75]">
                <div style={{ width: '156%', height: '139%' }}>
                  <ProfileView profile={previewProfile} />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-ink-faint">
            Live preview — a real Kloa.lol profile
          </p>
        </motion.div>
      </div>
    </section>
  );
}
