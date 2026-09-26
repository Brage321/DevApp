import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Color picker — native input + hex field                             */
/* ------------------------------------------------------------------ */

interface ColorPickerProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}

/** Accepts any css color string; native picker receives a hex best-effort. */
export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const hex = value.startsWith('#') ? value.slice(0, 7) : '#7c5cff';
  return (
    <div className="space-y-1.5">
      {label && <span className="block text-[13px] font-medium text-ink-dim">{label}</span>}
      <div className="flex items-center gap-2">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-line">
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label ? `${label} color` : 'Pick color'}
            className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-0 bg-transparent p-0"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="input-base font-mono text-xs"
          aria-label={label ? `${label} color value` : 'Color value'}
        />
      </div>
    </div>
  );
}

interface TabsProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn('flex gap-1 overflow-x-auto rounded-xl border border-line bg-white/[0.03] p-1', className)}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200',
            active === t.id ? 'bg-white/[0.09] text-white shadow-sm' : 'text-ink-dim hover:text-ink'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
