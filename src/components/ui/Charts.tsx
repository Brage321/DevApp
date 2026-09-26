import { useMemo } from 'react';
import type { DayPoint } from '@/types';
import { formatNumber } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Lightweight SVG charts — no chart library, consistent with design.  */
/* ------------------------------------------------------------------ */

const W = 640;
const H = 180;
const PAD = 8;

export function AreaChart({ data, accent = '#8B5CF6' }: { data: DayPoint[]; accent?: string }) {
  const { line, area, max } = useMemo(() => {
    const values = data.map((d) => d.views);
    const max = Math.max(1, ...values);
    const stepX = (W - PAD * 2) / Math.max(1, data.length - 1);
    const pts = data.map((d, i) => {
      const x = PAD + i * stepX;
      const y = H - PAD - (d.views / max) * (H - PAD * 3);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return {
      line: `M${pts.join('L')}`,
      area: `M${PAD},${H - PAD} L${pts.join('L')} L${W - PAD},${H - PAD} Z`,
      max,
    };
  }, [data]);

  if (data.length === 0) {
    return <div className="flex h-44 items-center justify-center text-sm text-ink-faint">No data yet</div>;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" preserveAspectRatio="none" role="img" aria-label="Views over the last 30 days">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={H * f} y2={H * f} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#areaFill)" />
      <path d={line} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle
        cx={W - PAD}
        cy={H - PAD - (data[data.length - 1]?.views ?? 0 / max) * (H - PAD * 3)}
        r="4"
        fill={accent}
      />
    </svg>
  );
}

export function BarList({
  items,
  accent = '#8B5CF6',
}: {
  items: { label: string; value: number }[];
  accent?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.label} className="space-y-1.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-medium text-ink">{i.label}</span>
            <span className="tabular-nums text-ink-faint">{formatNumber(i.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(i.value / max) * 100}%`, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Donut({
  items,
  accent = '#8B5CF6',
}: {
  items: { label: string; value: number }[];
  accent?: string;
}) {
  const total = Math.max(1, items.reduce((a, b) => a + b.value, 0));
  const colors = [accent, '#60A5FA', '#F472B6', '#34D399', '#FBBF24'];
  let offset = 0;
  const C = 2 * Math.PI * 42;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="h-32 w-32 shrink-0 -rotate-90" role="img" aria-label="Device breakdown">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        {items.map((i, idx) => {
          const frac = i.value / total;
          const seg = (
            <circle
              key={i.label}
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={colors[idx % colors.length]}
              strokeWidth="12"
              strokeDasharray={`${frac * C} ${C}`}
              strokeDashoffset={-offset * C}
              strokeLinecap="butt"
            />
          );
          offset += frac;
          return seg;
        })}
      </svg>
      <ul className="min-w-0 space-y-2">
        {items.map((i, idx) => (
          <li key={i.label} className="flex items-center gap-2 text-[13px]">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: colors[idx % colors.length] }}
            />
            <span className="text-ink">{i.label}</span>
            <span className="ml-auto tabular-nums text-ink-faint">
              {Math.round((i.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
