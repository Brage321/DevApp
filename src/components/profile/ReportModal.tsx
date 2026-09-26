import { useState } from 'react';
import { Modal } from '@/components/ui/Surfaces';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Inputs';
import { useToast } from '@/hooks/useToast';
import { getBackend } from '@/services/backend';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* ReportModal — let visitors report profiles for moderation.          */
/* ------------------------------------------------------------------ */

const REASONS = [
  'Spam',
  'Harassment',
  'Impersonation',
  'Malicious link',
  'Illegal content',
  'Other',
] as const;

export function ReportModal({
  username,
  open,
  onClose,
}: {
  username: string;
  open: boolean;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<string>('Spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const submit = async () => {
    setSubmitting(true);
    try {
      await getBackend().reports.create(username, reason, details);
      toast.success('Report submitted. Thank you.');
      onClose();
      setDetails('');
    } catch {
      toast.error('Could not submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Report @${username}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-sm transition-colors',
                reason === r
                  ? 'border-accent/60 bg-accent/10 text-white'
                  : 'border-line text-ink-dim hover:border-line-strong hover:text-ink'
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <Textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Additional details (optional)"
          maxLength={500}
          aria-label="Report details"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={submitting} onClick={() => void submit()}>
            Submit report
          </Button>
        </div>
      </div>
    </Modal>
  );
}
