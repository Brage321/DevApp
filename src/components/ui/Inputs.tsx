import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Form primitives                                                     */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}

export function Field({ label, hint, error, children, htmlFor }: FieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink-dim">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('input-base', className)} {...rest} />;
}

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('input-base min-h-24 resize-y', className)} {...rest} />;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({ options, className, ...rest }: SelectProps) {
  return (
    <select className={cn('input-base appearance-none bg-bg2 pr-8', className)} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-bg2">
          {o.label}
        </option>
      ))}
    </select>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 disabled:opacity-40',
        checked ? 'border-accent/60 bg-accent/80' : 'border-line bg-white/[0.06]'
      )}
    >
      <span
        className={cn(
          'absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-200',
          checked ? 'left-[22px]' : 'left-0.5'
        )}
        style={{ height: 18, width: 18 }}
      />
    </button>
  );
}

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label?: string;
  suffix?: string;
}

export function Slider({ value, min, max, step = 1, onChange, label, suffix }: SliderProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between text-[13px]">
          <label htmlFor={id} className="font-medium text-ink-dim">
            {label}
          </label>
          <span className="tabular-nums text-ink-faint">
            {value}
            {suffix}
          </span>
        </div>
      )}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet
          [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet
          [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(124,92,255,0.6)]"
      />
    </div>
  );
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line-strong bg-bg2 px-2.5 py-1.5 text-xs text-ink opacity-0 shadow-soft transition-opacity duration-150 group-hover/tt:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
