import { useDashboard } from '@/components/dashboard/DashboardContext';
import { Card } from '@/components/ui/Surfaces';
import { Slider } from '@/components/ui/Inputs';
import { EFFECT_CATALOG } from '@/lib/config';
import type { EffectType } from '@/types';
import { cn } from '@/lib/utils';

/** Dashboard → Effects: toggle visual effects + intensity. */
export default function EffectsSection() {
  const { profile, update } = useDashboard();
  if (!profile) return null;
  const effects = profile.effects;

  const toggle = (id: EffectType) => {
    const enabled = effects.enabled.includes(id)
      ? effects.enabled.filter((e) => e !== id)
      : [...effects.enabled, id];
    update({ effects: { ...effects, enabled } });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-white">Effects</h1>
        <p className="mt-1 text-sm text-ink-dim">
          Layer subtle atmosphere onto your profile. Animated effects are automatically simplified on
          low-power devices and for visitors with reduced-motion enabled.
        </p>
      </header>

      <Card className="space-y-5">
        <h2 className="font-display text-sm font-semibold text-white">Active effects</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EFFECT_CATALOG.map((e) => {
            const active = effects.enabled.includes(e.id);
            return (
              <button
                key={e.id}
                onClick={() => toggle(e.id)}
                aria-pressed={active}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all duration-200',
                  active
                    ? 'border-accent/50 bg-accent/[0.08] shadow-glow'
                    : 'border-line bg-white/[0.02] hover:border-line-strong'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('text-sm font-semibold', active ? 'text-white' : 'text-ink-dim')}>
                    {e.label}
                  </span>
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      active ? 'bg-accent-soft shadow-[0_0_8px_rgba(167,139,250,0.8)]' : 'bg-white/15'
                    )}
                  />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">{e.description}</p>
              </button>
            );
          })}
        </div>

        <Slider
          label="Intensity"
          value={effects.intensity}
          min={10}
          max={100}
          onChange={(v) => update({ effects: { ...effects, intensity: v } })}
          suffix="%"
        />
        <p className="text-[11px] text-ink-faint">
          Performance: particle counts are hard-capped and rendered on a single canvas at capped
          pixel ratio — no massive DOM nodes.
        </p>
      </Card>
    </div>
  );
}
