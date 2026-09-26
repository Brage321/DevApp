import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { AuthShell } from './AuthShell';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Inputs';
import { ErrorNote } from '@/components/ui/Surfaces';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { getBackend } from '@/services/backend';

/** Reached from the Supabase password-reset email link. */
export default function ResetPassword() {
  useDocumentMeta({ title: 'Set a new password', robots: 'noindex' });
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    // Supabase delivers the recovery session via URL hash; give auth a beat to hydrate.
    const t = window.setTimeout(async () => {
      const user = await getBackend().auth.getUser();
      if (!user) setSessionError(true);
    }, 800);
    return () => window.clearTimeout(t);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Set a new password" subtitle="Choose something strong and unique.">
      {sessionError ? (
        <ErrorNote message="This reset link is invalid or has expired. Request a new one from the forgot-password page." />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && <ErrorNote message={error} />}
          <Field label="New password" htmlFor="np">
            <Input
              id="np"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label="Confirm password" htmlFor="npc">
            <Input
              id="npc"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={loading} className="w-full" size="lg" icon={<KeyRound size={16} />}>
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
