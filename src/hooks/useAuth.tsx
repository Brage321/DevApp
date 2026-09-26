import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getBackend, isDemoMode } from '@/services/backend';
import type { SessionUser } from '@/types';

/* ------------------------------------------------------------------ */
/* Auth context — wraps the backend's auth API.                        */
/* In demo mode credentials are simulated locally (clearly labeled).   */
/* ------------------------------------------------------------------ */

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<{ needsVerification: boolean }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const backend = getBackend();

  const refresh = useCallback(async () => {
    try {
      setUser(await backend.auth.getUser());
    } catch {
      setUser(null);
    }
  }, [backend]);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
    const unsub = backend.auth.onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, [backend, refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isDemo: isDemoMode,
      signIn: async (email, password) => {
        const u = await backend.auth.signIn(email, password);
        setUser(u);
      },
      signUp: async (email, password, username) => {
        const res = await backend.auth.signUp(email, password, username);
        if (res.user) setUser(res.user);
        else await refresh();
        return { needsVerification: res.needsVerification };
      },
      signOut: async () => {
        await backend.auth.signOut();
        setUser(null);
      },
      sendPasswordReset: (email) => backend.auth.sendPasswordReset(email),
      updatePassword: (pw) => backend.auth.updatePassword(pw),
      refresh,
    }),
    [backend, user, loading, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
