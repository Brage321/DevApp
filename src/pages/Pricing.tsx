import { Check, HelpCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SectionHeading } from '@/components/ui/Surfaces';
import { Button } from '@/components/ui/Button';
import { PRICING_PLANS } from '@/lib/config';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { cn } from '@/lib/utils';

export default function Pricing() {
  useDocumentMeta({
    title: 'Pricing',
    description: 'Simple, transparent plans for your Kloa.lol profile. Start free, upgrade when you outgrow it.',
    path: '/pricing',
  });

  return (
    <div className="min-h-screen bg-bg0">
      <Navbar />
      <main className="relative overflow-hidden pb-24 pt-32">
        <div
          className="absolute left-1/2 top-[-180px] h-[460px] w-[760px] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
          style={{ background: 'radial-gradient(closest-side, #7C5CFF, transparent)' }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            center
            title="Keep it simple, scale when you need to"
            subtitle="Every plan includes the editor. The paid tiers just add more room for your page to grow."
          />
          <div className="mt-16 grid gap-4 lg:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-7 transition-colors duration-300',
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
                <h2 className="font-display text-xl font-semibold text-white">{plan.name}</h2>
                <p className="mt-1.5 text-sm text-ink-dim">{plan.description}</p>
                <p className="mt-6">
                  <span className="font-display text-5xl font-bold text-white">{plan.price}</span>
                  <span className="ml-2 text-sm text-ink-faint">{plan.period}</span>
                </p>
                <ul className="mt-7 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink-dim">
                      <Check size={16} className="mt-0.5 shrink-0 text-accent-soft" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  to={plan.id === 'free' ? '/register' : '/contact'}
                  variant={plan.highlight ? 'primary' : 'secondary'}
                  className="mt-8 w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-line bg-bg1/60 p-6">
            <div className="flex items-start gap-3">
              <HelpCircle size={18} className="mt-0.5 shrink-0 text-accent-soft" />
              <p className="text-sm leading-relaxed text-ink-dim">
                <span className="font-medium text-ink">A quick note:</span> Kloa.lol does not process
                payments yet. The paid-plan buttons currently route to contact while a payment provider
                is added — no card details are ever requested inside the app right now.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
