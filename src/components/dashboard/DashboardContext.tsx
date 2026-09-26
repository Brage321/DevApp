import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Profile } from '@/types';
import { getBackend } from '@/services/backend';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { defaultProfile } from '@/lib/defaults';
import { normalizeUsername } from '@/lib/security';

/* ------------------------------------------------------------------ */
/* Editor context — draft profile + live preview + save system.        */
/* Every control mutates the DRAFT; the live preview re-renders        */
/* instantly. Nothing is persisted until "Save changes".               */
/* ------------------------------------------------------------------ */

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface DashboardCtx {
  profile: Profile | null;
  loading: boolean;
  dirty: boolean;
  saveState: SaveState;
  update: (patch: DeepPartial<Profile>) => void;
  replaceProfile: (p: Profile) => void;
  save: () => Promise<boolean>;
  revert: () => void;
}

const Ctx = createContext<DashboardCtx | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saved, setSaved] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const loadedFor = useRef<string | null>(null);

  // Load (or create) the user's profile once per session.
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setSaved(null);
      setLoading(false);
      loadedFor.current = null;
      return;
    }
    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    setLoading(true);
    const backend = getBackend();
    void backend.profiles
      .getOwn()
      .then(async (p) => p ?? (await backend.profiles.ensureOwn(user.username || normalizeUsername(user.email))))
      .then((p) => {
        setProfile(p);
        setSaved(p);
      })
      .catch(() => {
        toast.error('Unable to load your profile.');
        navigate('/', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [user, toast, navigate]);

  const update = useCallback((patch: DeepPartial<Profile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, ...patch } as Profile;
    });
    setSaveState('idle');
  }, []);

  const replaceProfile = useCallback((p: Profile) => {
    setProfile(p);
    setSaveState('idle');
  }, []);

  const save = useCallback(async () => {
    if (!profile) return false;
    setSaveState('saving');
    try {
      await getBackend().profiles.saveOwn(profile);
      setSaved(profile);
      setSaveState('saved');
      toast.success('Profile saved.');
      return true;
    } catch (err) {
      setSaveState('error');
      toast.error(err instanceof Error ? err.message : 'Could not save. Please try again.');
      return false;
    }
  }, [profile, toast]);

  const revert = useCallback(() => {
    if (saved) {
      setProfile(saved);
      setSaveState('idle');
    }
  }, [saved]);

  const value = useMemo<DashboardCtx>(
    () => ({
      profile,
      loading,
      dirty: profile !== null && saved !== null && profile !== saved,
      saveState,
      update,
      replaceProfile,
      save,
      revert,
    }),
    [profile, loading, saved, saveState, update, replaceProfile, save, revert]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboard(): DashboardCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDashboard must be used inside <DashboardProvider>.');
  return ctx;
}

export { defaultProfile };
