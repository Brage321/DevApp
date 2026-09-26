import { DEFAULT_THEME } from '@/lib/config';
import type {
  AvatarConfig,
  BackgroundConfig,
  CardConfig,
  EffectsConfig,
  IntroConfig,
  MusicConfig,
  Profile,
  ThemeConfig,
} from '@/types';
import { uid } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Profile default factory + deep merge (used by demo seed & signups)  */
/* ------------------------------------------------------------------ */

export function defaultTheme(): ThemeConfig {
  return { ...DEFAULT_THEME.theme };
}

export function defaultBackground(): BackgroundConfig {
  return {
    type: 'gradient',
    color: '#050505',
    gradient: { from: '#1b1440', to: '#0b1026', angle: 135 },
    imageUrl: '',
    videoUrl: '',
    blur: 0,
    brightness: 100,
    saturation: 100,
    contrast: 100,
    opacity: 100,
    position: 'center',
    scale: 100,
    videoLoop: true,
    videoMuted: true,
    videoSpeed: 1,
    videoOpacity: 100,
    videoBlur: 0,
    overlay: 35,
  };
}

export function defaultCard(): CardConfig {
  return {
    mode: 'glass',
    width: 520,
    opacity: 70,
    blur: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    radius: 24,
    shadow: 55,
    background: '#0D0D12',
    gradient: null,
    padding: 36,
  };
}

export function defaultAvatar(): AvatarConfig {
  return {
    url: '',
    size: 112,
    shape: 'circle',
    radius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    glow: 30,
    shadow: 40,
  };
}

export function defaultMusic(): MusicConfig {
  return {
    enabled: false,
    title: '',
    artist: '',
    coverUrl: '',
    audioUrl: '',
    volume: 60,
    loop: true,
    autoplay: false,
  };
}

export function defaultIntro(): IntroConfig {
  return {
    enabled: false,
    text: 'kloa.lol',
    duration: 1600,
    blur: true,
    fade: true,
    background: '#050505',
  };
}

export function defaultEffects(): EffectsConfig {
  return { enabled: [], intensity: 55 };
}

export function defaultProfile(userId: string, username: string, displayName: string): Profile {
  const now = new Date().toISOString();
  return {
    id: uid(),
    userId,
    username,
    displayName,
    bio: 'Just joined Kloa.lol ✦',
    themeId: DEFAULT_THEME.id,
    theme: defaultTheme(),
    background: defaultBackground(),
    card: defaultCard(),
    avatar: defaultAvatar(),
    socials: [],
    links: [],
    music: defaultMusic(),
    intro: defaultIntro(),
    effects: defaultEffects(),
    badges: [],
    visibility: 'public',
    featured: false,
    views: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/* ----------------------------- deep merge -------------------------- */

type Plain = Record<string, unknown>;

export function isPlainObject(v: unknown): v is Plain {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function mergeDeep<T>(base: T, patch: unknown): T {
  if (!isPlainObject(patch) || !isPlainObject(base)) {
    return (patch === undefined ? base : (structuredClone(patch) as T)) as T;
  }
  const out: Plain = { ...(base as unknown as Plain) };
  for (const [k, v] of Object.entries(patch)) {
    const b = out[k];
    out[k] = isPlainObject(b) && isPlainObject(v) ? mergeDeep(b, v) : structuredClone(v);
  }
  return out as T;
}

/** Resolve a theme config from themeId + stored custom theme. */
export function resolveTheme(p: Pick<Profile, 'themeId' | 'theme'>): ThemeConfig {
  return p.theme ?? defaultTheme();
}
