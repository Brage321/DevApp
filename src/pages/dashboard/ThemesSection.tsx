import { useDashboard } from '@/components/dashboard/DashboardContext';
import { Card } from '@/components/ui/Surfaces';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { BUILT_IN_THEMES } from '@/lib/config';
import type { ThemeConfig } from '@/types';
import { cn } from '@/lib/utils';

/** Dashboard → Themes: 10 built-in presets + custom theme editor. */
export default function ThemesSection() {
  const { profile, update } = useDashboard();
  if (!profile) return null;
  const theme = profile.theme;

  const applyPreset = (id: string, t: ThemeConfig) => update({ themeId: id, theme: t });
  const setVar = (key: keyof ThemeConfig, value: string) =>
    update({ themeId: 'custom', theme: { ...theme, [key]: value } });

  const CUSTOM_VARS: { key: keyof ThemeConfig; label: string }[] = [
    { key: 'background', label: 'Background' },
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'text', label: 'Text' },
    { key: 'card', label: 'Card' },
    { key: 'border', label: 'Border' },
    { key: 'glow', label: 'Glow' },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-white">Themes</h1>
        <p className="mt-1 text-sm text-ink-dim">Start from a preset, then fine-tune every color.</p>
      </header>

      <Card className="space-y-4">
        <h2 className="font-display text-sm font-semibold text-white">Built-in themes</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BUILT_IN_THEMES.map((t) => {
            const active = profile.themeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => applyPreset(t.id, t.theme)}
                aria-pressed={active}
                className={cn(
                  'group overflow-hidden rounded-xl border text-left transition-all duration-200',
                  active ? 'border-accent/60 shadow-glow' : 'border-line hover:border-line-strong'
                )}
              >
                <span className="block h-14 w-full" style={{ background: t.preview }} />
                <span className="flex items-center justify-between px-3 py-2 text-xs font-medium text-ink-dim group-hover:text-ink">
                  {t.label}
                  {active && <span className="text-accent-soft">●</span>}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-5">
        <div>
          <h2 className="font-display text-sm font-semibold text-white">Custom theme</h2>
          <p className="mt-1 text-xs text-ink-faint">Editing any variable switches your profile to a custom theme.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CUSTOM_VARS.map((v) => (
            <ColorPicker
              key={v.key}
              label={v.label}
              value={String(theme[v.key])}
              onChange={(val) => setVar(v.key, val)}
            />
          ))}
        </div>
        <p className="text-[11px] leading-relaxed text-ink-faint">
          Card / border colors accept rgba() for transparency. Themes are stored with your profile
          and included in exports.
        </p>
      </Card>
    </div>
  );
}
