import { ArrowRight, Check } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Showcase } from '@/components/landing/Showcase';
import { Faq } from '@/components/landing/Faq';
import { SectionHeading } from '@/components/ui/Surfaces';
import { Button } from '@/components/ui/Button';
import { PRICING_PLANS } from '@/lib/config';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { cn } from '@/lib/utils';

const STEPS = [
  { n: '01', title: 'Pick your handle', desc: 'Grab the username that fits you and keep it easy to remember.' },
  { n: '02', title: 'Shape the vibe', desc: 'Add your links, music, colors, and little details until it feels like you.' },
  { n: '03', title: 'Send the link', desc: 'Share one clean place for everything you want people to find.' },
];

export default function Landing() {
  useDocumentMeta({
    title: 'Kloa.lol — Your identity. Your page.',
    description:
      'Create a profile that actually feels like you. Kloa.lol is a premium profile platform with themes, music, effects, links and analytics.',
    path: '/',
  });

  return (
    <div className="min-h-screen bg-bg0">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Showcase />

        <section className="py-24" aria-label="How it works">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading center title="Live in three steps" />
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.n} className="relative rounded-2xl border border-line bg-bg1/70 p-6">
                  <span className="font-display text-sm font-semibold text-accent-soft">{s.n}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-dim">{s.desc}</p>
                  {i < STEPS.length - 1 && (
                    <ArrowRight
                      className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-ink-faint md:block"
                      aria-hidden
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24" aria-label="Pricing preview">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              center
              title="Keep it simple, upgrade when it makes sense."
              subtitle="Straightforward plans for a page that grows with you."
            />
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {PRICING_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    'relative flex flex-col rounded-2xl border p-6 transition-colors duration-300',
                    plan.highlight
                      ? 'border-accent/40 bg-gradient-to-b from-accent/[0.09] to-bg1 shadow-glow'
                      : 'border-line bg-bg1/70'
                  )}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white shadow-glow">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-display text-lg font-semibold text-white">{plan.name}</h3>
                  <p className="mt-1 text-sm text-ink-dim">{plan.description}</p>
                  <p className="mt-5">
                    <span className="font-display text-4xl font-bold text-white">{plan.price}</span>
                    <span className="ml-1.5 text-sm text-ink-faint">{plan.period}</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-ink-dim">
                        <Check size={15} className="mt-0.5 shrink-0 text-accent-soft" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button to="/pricing" variant={plan.highlight ? 'primary' : 'secondary'} className="mt-7 w-full">
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Faq />

        <section className="relative overflow-hidden py-28" aria-label="Call to action">
          <div
            className="absolute left-1/2 top-1/2 h-[380px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[110px]"
            style={{ background: 'radial-gradient(closest-side, #7C5CFF, #3B82F6 60%, transparent)' }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-display text-display-lg font-bold text-white">
              Your internet corner is still yours to shape.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ink-dim">
              Make a page that feels like you, not a template. It takes a minute to get started.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button to="/register" size="lg" icon={<ArrowRight size={17} />}>
                Create your profile
              </Button>
              <Button to="/explore" variant="secondary" size="lg">
                Explore profiles
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
