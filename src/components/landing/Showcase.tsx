import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { SectionHeading, Avatar } from '@/components/ui/Surfaces';
import { BadgeRow } from '@/components/ui/Badge';
import { showcaseProfiles } from '@/lib/demoSeed';
import { formatNumber } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Showcase — interactive fictional profile cards                       */
/* ------------------------------------------------------------------ */

export function Showcase() {
  const profiles = showcaseProfiles();

  return (
    <section id="showcase" className="relative scroll-mt-24 py-24" aria-label="Profile showcase">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          center
          eyebrow="Showcase"
          title="Pages with personality"
          subtitle="Every Kloa.lol profile is a canvas. Here are a few built with the editor — click one to open it."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {profiles.map((p, i) => (
            <motion.div
              key={p.username}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/${p.username}`}
                className="card-hover group block overflow-hidden rounded-2xl border border-line focus-visible:outline-accent-soft"
                aria-label={`Open @${p.username}'s profile`}
              >
                <div
                  className="relative h-28"
                  style={{ background: p.background.gradient
                    ? `linear-gradient(${p.background.gradient.angle}deg, ${p.background.gradient.from}, ${p.background.gradient.to})`
                    : p.background.color }}
                >
                  <div className="noise absolute inset-0 opacity-[0.08]" />
                  <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] text-white/80 backdrop-blur">
                    <Eye size={10} />
                    {formatNumber(p.views)}
                  </span>
                </div>
                <div className="relative bg-bg1/80 p-4 pt-0">
                  <div className="-mt-6 mb-3">
                    <Avatar name={p.displayName} accent={p.theme.accent} size={48} className="border-2 border-bg1" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-display text-sm font-semibold text-white">
                      {p.displayName}
                    </span>
                    <BadgeRow badges={p.badges} size="sm" />
                  </div>
                  <span className="text-xs text-ink-faint">@{p.username}</span>
                  <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-relaxed text-ink-dim">
                    {p.bio.split('\n')[0]}
                  </p>
                  <span className="mt-3 inline-block text-xs font-medium text-accent-soft opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    View profile →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
