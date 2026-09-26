import { useState } from 'react';
import { MailCheck, RefreshCw } from 'lucide-react';
import { AuthShell } from './AuthShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

/** Shown after signup when email confirmation is enabled (Supabase). */
export default function Verify() {
  useDocumentMeta({ title: 'Verify your email', robots: 'noindex' });
  const { user, sendPasswordReset } = useAuth();
  const [resent, setResent] = useState(false);

  return (
    <AuthShell title="Check your inbox" subtitle="One more step to activate your profile.">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-bg2">
          <MailCheck size={24} className="text-accent-soft" />
        </div>
        <p className="text-sm leading-relaxed text-ink-dim">
          We sent a verification link to{' '}
          <span className="text-ink">{user?.email ?? 'your email'}</span>. Click it to activate your
          Kloa.lol profile.
        </p>
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw size={14} />}
          disabled={resent || !user?.email}
          onClick={() => {
            if (user?.email) {
              void sendPasswordReset(user.email).then(() => setResent(true)).catch(() => undefined);
            }
          }}
        >
          {resent ? 'Email sent again' : 'Resend email'}
        </Button>
      </div>
    </AuthShell>
  );
}
