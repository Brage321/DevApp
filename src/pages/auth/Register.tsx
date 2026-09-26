import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from './AuthShell';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Inputs';
import { ErrorNote } from '@/components/ui/Surfaces';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { usernameError, normalizeUsername } from '@/lib/security';
import { getBackend } from '@/services/backend';

export default function Register() {
  useDocumentMeta({ title: 'Create your profile', robots: 'noindex' });
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avail, setAvail] = useState<boolean | null>(null);

  const normalized = normalizeUsername(username);
  const localError = username ? usernameError(normalized) : null;

  const checkAvailability = async () => {
    if (localError || !normalized) return;
    try {
      setAvail(await getBackend().profiles.isUsernameAvailable(normalized));
    } catch {
      setAvail(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const uErr = usernameError(normalized);
    if (uErr) {
      setError(uErr);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const { needsVerification } = await signUp(email, password, normalized);
      navigate(needsVerification ? '/verify' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Claim your username"
      subtitle="kloa.lol/you is waiting. Create your account."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent-soft hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form
        onSubmit={submit}
        className="space-y-4"
        onBlur={(e) => {
          if ((e.target as HTMLElement).id === 'username') void checkAvailability();
        }}
      >
        {error && <ErrorNote message={error} />}

        <Field
          label="Username"
          htmlFor="username"
          hint={
            localError
              ? undefined
              : avail === true
                ? '✓ Available — this becomes kloa.lol/' + normalized
                : avail === false
                  ? 'That username is taken.'
                  : '3–24 chars · letters, numbers, _ and -'
          }
          error={localError ?? undefined}
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
              kloa.lol/
            </span>
            <Input
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase());
                setAvail(null);
              }}
              required
              minLength={3}
              maxLength={24}
              pattern="[a-z0-9_-]{3,24}"
              autoComplete="username"
              placeholder="yourname"
              className="pl-[4.6rem]"
              aria-invalid={Boolean(localError)}
            />
          </div>
        </Field>

        <Field label="Email" htmlFor="reg-email">
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password" htmlFor="reg-password" hint="At least 8 characters.">
          <Input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create profile
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-ink-faint">
          By continuing you agree to our{' '}
          <Link to="/terms" className="underline hover:text-ink-dim">Terms</Link> and{' '}
          <Link to="/privacy" className="underline hover:text-ink-dim">Privacy Policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
}
