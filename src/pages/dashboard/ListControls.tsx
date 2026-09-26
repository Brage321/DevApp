import { EyeOff, Eye, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Shared row controls for reorderable lists (keyboard/touch friendly). */
export function ListControls({
  onUp, onDown, disableUp, disableDown, hidden, onToggleHidden, onRemove,
}: {
  onUp: () => void;
  onDown: () => void;
  disableUp: boolean;
  disableDown: boolean;
  hidden: boolean;
  onToggleHidden: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <IconBtn label="Move up" onClick={onUp} disabled={disableUp}><ChevronUp size={14} /></IconBtn>
      <IconBtn label="Move down" onClick={onDown} disabled={disableDown}><ChevronDown size={14} /></IconBtn>
      <IconBtn label={hidden ? 'Show' : 'Hide'} onClick={onToggleHidden}>
        {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
      </IconBtn>
      <IconBtn label="Remove" onClick={onRemove} danger><Trash2 size={14} /></IconBtn>
    </div>
  );
}

function IconBtn({
  label, onClick, children, disabled, danger,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'rounded-lg p-2 text-ink-faint transition-colors hover:bg-white/[0.07] hover:text-ink disabled:opacity-30',
        danger && 'hover:text-red-400'
      )}
    >
      {children}
    </button>
  );
}
