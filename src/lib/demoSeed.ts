import type {
  CustomLink,
  Profile,
  SocialLink,
  SocialPlatform,
  BadgeId,
} from '@/types';
import { defaultProfile, mergeDeep } from '@/lib/defaults';
import { DEMO_TRACK_URLS } from '@/lib/config';

/* Demo seed data — fictional Kloa.lol profiles.                        */
/* DEMO ONLY: exists so the static site has content without a backend.  */
/* No real people or private information is represented.                */

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function s(username: string, order: number, platform: SocialPlatform, url: string): SocialLink {
  return { id: `${username}-soc-${order}`, platform, url, label: '', hidden: false, order };
}

function l(
  username: string,
  order: number,
  title: string,
  url: string,
  description = '',
  color = '#8B5CF6'
): CustomLink {
  return {
    id: `${username}-link-${order}`, title, description, url, imageUrl: '',
    color, gradient: null, hover: 'lift', hidden: false, order,
  };
}

function demoProfile(username: string, displayName: string, bio: string, patch: DeepPartial<Profile>): Profile {
  return mergeDeep(
    defaultProfile(`demo-user-${username}`, username, displayName),
    { bio, badges: ['early'] as BadgeId[], ...patch }
  );
}

const VIEWS: Record<string, number> = {
  nova: 128453, void: 98211, luna: 76430, kai: 54187, echo: 47260,
  riven: 23145, salem: 19204, juno: 15233, orion: 12904, mira: 9450,
  atlas: 7420, vex: 6211, nyx: 4180,
};

const CREATED: Record<string, string> = {
  nova: '2024-02-10T10:00:00Z', void: '2024-03-22T10:00:00Z', luna: '2024-04-02T10:00:00Z',
  kai: '2024-05-18T10:00:00Z', echo: '2024-06-30T10:00:00Z', riven: '2024-08-12T10:00:00Z',
  salem: '2024-09-25T10:00:00Z', juno: '2024-11-03T10:00:00Z', orion: '2025-01-14T10:00:00Z',
  mira: '2025-02-27T10:00:00Z', atlas: '2025-04-08T10:00:00Z', vex: '2025-06-19T10:00:00Z',
  nyx: '2025-08-01T10:00:00Z',
};

export function demoViews(username: string): number {
  return VIEWS[username] ?? 500 + ((username.length * 137) % 3000);
}

export function demoCreatedAt(username: string): string {
  return CREATED[username] ?? '2025-09-01T10:00:00Z';
}

function buildShowcase(): Profile[] {
  const nova = demoProfile('nova', 'Nova', 'digital dreamer ✦\nbuilding quiet things in loud places.\n⇢ 18 · she/her', {
    themeId: 'midnight',
    theme: {
      background: '#0A0618', primary: '#A78BFA', secondary: '#F472B6',
      accent: '#A78BFA', text: '#EDEDF2', card: 'rgba(30,20,60,0.45)',
      border: 'rgba(167,139,250,0.22)', glow: '#A78BFA',
    },
    background: { type: 'animated-gradient', gradient: { from: '#1E1043', to: '#3B1D6E', angle: 140 }, overlay: 25 },
    card: { mode: 'glass', width: 520, opacity: 55, blur: 22, radius: 26, borderColor: 'rgba(167,139,250,0.25)' },
    avatar: { glow: 55, borderColor: 'rgba(167,139,250,0.5)' },
    socials: [s('nova', 0, 'discord', 'nova'), s('nova', 1, 'x', 'novadsgn'), s('nova', 2, 'instagram', 'nova.lol'), s('nova', 3, 'spotify', 'novamusic')],
    links: [
      l('nova', 0, 'My portfolio', 'https://example.com/nova', 'Selected work & experiments', '#8B5CF6'),
      l('nova', 1, 'Lofi playlist', 'https://open.spotify.com/', 'sounds for late nights', '#1DB954'),
      l('nova', 2, 'Commission me', 'https://example.com/queue', '2 slots open', '#F472B6'),
    ],
    music: { enabled: true, title: 'Neon Skyline', artist: 'Nightdrive', audioUrl: DEMO_TRACK_URLS[0], volume: 55, loop: true },
    intro: { enabled: true, text: 'nova', duration: 1500, blur: true, fade: true, background: '#0A0618' },
    effects: { enabled: ['stars', 'cursorGlow', 'grain'], intensity: 60 },
    badges: ['verified', 'early', 'creator'],
    featured: true,
  });

  const voidp = demoProfile('void', 'VOID', 'nothing here.\neverything here.', {
    themeId: 'void',
    theme: {
      background: '#050505', primary: '#EDEDF2', secondary: '#9B9BA8',
      accent: '#EDEDF2', text: '#EDEDF2', card: 'rgba(255,255,255,0.03)',
      border: 'rgba(255,255,255,0.12)', glow: '#EDEDF2',
    },
    background: { type: 'solid', color: '#050505', overlay: 0 },
    card: { mode: 'minimal', width: 480, opacity: 100, blur: 0, radius: 8, borderWidth: 0, shadow: 0, background: 'transparent' },
    avatar: { shape: 'rounded', radius: 8, glow: 0, borderWidth: 1 },
    socials: [s('void', 0, 'github', 'voiddev'), s('void', 1, 'x', 'v0id')],
    links: [l('void', 0, 'essays', 'https://example.com/void', 'occasional writing', '#EDEDF2')],
    music: { enabled: true, title: 'Static Bloom', artist: '∅', audioUrl: DEMO_TRACK_URLS[1], volume: 40, loop: true },
    effects: { enabled: ['grain', 'vignette'], intensity: 40 },
    badges: ['og'],
    featured: true,
  });

  const luna = demoProfile('luna', 'Luna', '🌙 night owl\npixel artist & game dev\ncommissions open ↓', {
    themeId: 'ocean',
    theme: {
      background: '#020D1A', primary: '#60A5FA', secondary: '#38BDF8',
      accent: '#60A5FA', text: '#EDEDF2', card: 'rgba(10,30,55,0.5)',
      border: 'rgba(96,165,250,0.25)', glow: '#60A5FA',
    },
    background: { type: 'gradient', gradient: { from: '#0B1B3A', to: '#1E3A8A', angle: 160 }, overlay: 20 },
    card: { mode: 'glass', width: 540, opacity: 60, blur: 24, radius: 30, borderColor: 'rgba(96,165,250,0.3)' },
    avatar: { glow: 65 },
    socials: [s('luna', 0, 'twitch', 'lunaplays'), s('luna', 1, 'youtube', 'lunapixels'), s('luna', 2, 'discord', 'luna')],
    links: [
      l('luna', 0, 'Watch me draw', 'https://twitch.tv/', 'live most nights', '#9146FF'),
      l('luna', 1, 'Art tag', 'https://example.com/art', 'latest pieces', '#38BDF8'),
    ],
    effects: { enabled: ['stars', 'snow'], intensity: 50 },
    badges: ['creator', 'supporter'],
    featured: true,
  });


  const kai = demoProfile('kai', 'kai', 'restless. curated chaos.\ndark mode everything.', {
    themeId: 'crimson',
    theme: {
      background: '#120404', primary: '#F87171', secondary: '#FCA5A5',
      accent: '#F87171', text: '#F5F5F4', card: 'rgba(40,10,10,0.5)',
      border: 'rgba(248,113,113,0.2)', glow: '#F87171',
    },
    background: { type: 'gradient', gradient: { from: '#1A0505', to: '#450A0A', angle: 120 }, overlay: 30 },
    card: { mode: 'card', width: 500, opacity: 85, blur: 0, radius: 18, borderWidth: 1, borderColor: 'rgba(248,113,113,0.25)', background: '#160707' },
    avatar: { shape: 'rounded', radius: 20, glow: 25 },
    socials: [s('kai', 0, 'steam', 'kaix'), s('kai', 1, 'youtube', 'kaired'), s('kai', 2, 'reddit', 'kai_r')],
    links: [l('kai', 0, 'My setup', 'https://example.com/setup', 'gear & software', '#F87171')],
    effects: { enabled: ['scanlines', 'vignette', 'particles'], intensity: 45 },
    badges: ['supporter'],
    featured: false,
  });

  const echo = demoProfile('echo', 'echo', 'audio engineer · synth addict\n「 turn it up 」', {
    themeId: 'aurora',
    theme: {
      background: '#06111A', primary: '#34D399', secondary: '#60A5FA',
      accent: '#34D399', text: '#EDEDF2', card: 'rgba(8,40,44,0.45)',
      border: 'rgba(52,211,153,0.25)', glow: '#34D399',
    },
    background: { type: 'animated-gradient', gradient: { from: '#022C22', to: '#1E3A8A', angle: 200 }, overlay: 25 },
    card: { mode: 'glass', width: 530, opacity: 60, blur: 20, radius: 24, borderColor: 'rgba(52,211,153,0.28)' },
    avatar: { glow: 60 },
    socials: [s('echo', 0, 'spotify', 'echowaves'), s('echo', 1, 'youtube', 'echosounds'), s('echo', 2, 'telegram', 'echochan')],
    links: [
      l('echo', 0, 'Latest pack', 'https://example.com/pack', 'free synth presets', '#34D399'),
      l('echo', 1, 'Book a session', 'https://example.com/book', 'mixing & mastering', '#60A5FA'),
    ],
    music: { enabled: true, title: 'Aurora Drift', artist: 'echo', audioUrl: DEMO_TRACK_URLS[2], volume: 65, loop: true },
    effects: { enabled: ['gradientAnim', 'particles', 'grain'], intensity: 55 },
    badges: ['verified', 'developer'],
    featured: true,
  });

  return [nova, voidp, luna, kai, echo];
}

/* ------------------------- explore extras -------------------------- */

function buildExtras(): Profile[] {
  const mk = (
    username: string, displayName: string, bio: string,
    themeId: string, accent: string, bg: [string, string], patch: DeepPartial<Profile> = {}
  ): Profile =>
    demoProfile(username, displayName, bio, {
      themeId,
      theme: {
        background: bg[0], primary: accent, secondary: accent,
        accent, text: '#EDEDF2', card: 'rgba(255,255,255,0.045)',
        border: 'rgba(255,255,255,0.1)', glow: accent,
      },
      background: { type: 'gradient', gradient: { from: bg[0], to: bg[1], angle: 150 }, overlay: 30 },
      ...patch,
    });

  return [
    mk('riven', 'riven', 'weightlifter. coffee addict.\n5am club.', 'ocean', '#38BDF8', ['#082F49', '#0C4A6E'], { socials: [s('riven', 0, 'instagram', 'rivenfit')] }),
    mk('salem', 'salem', 'witchy web dev 🕯\ncats, candles, css.', 'lavender', '#C4B5FD', ['#1E1B2E', '#3B2E5A'], { socials: [s('salem', 0, 'github', 'salemdev'), s('salem', 1, 'discord', 'salem')], effects: { enabled: ['stars'], intensity: 50 } }),
    mk('juno', 'juno', 'photographer\nchasing golden hour.', 'monochrome', '#FAFAFA', ['#171717', '#333333'], { background: { type: 'gradient', gradient: { from: '#0A0A0A', to: '#262626', angle: 150 }, overlay: 20 } }),
    mk('orion', 'orion', 'stargazer 🔭\nastrophysics grad.', 'cyber', '#22D3EE', ['#083344', '#155E75'], { socials: [s('orion', 0, 'x', 'orionsees')], effects: { enabled: ['stars', 'vignette'], intensity: 60 } }),
    mk('mira', 'mira', 'baking & binary.\nmatcha enthusiast.', 'neon', '#F472B6', ['#3B0D34', '#831843'], { socials: [s('mira', 1, 'instagram', 'mirabakes')] }),
    mk('atlas', 'atlas', 'travel map addict.\n37 countries and counting.', 'aurora', '#34D399', ['#022C22', '#065F46'], { socials: [s('atlas', 0, 'youtube', 'atlasgoes')] }),
    mk('vex', 'vex', 'combat robotics.\nwe build and we break.', 'crimson', '#F87171', ['#450A0A', '#7F1D1D'], { socials: [s('vex', 0, 'twitch', 'vexbots')] }),
    mk('nyx', 'nyx', 'quiet corners of the net.', 'void', '#EDEDF2', ['#0A0A0A', '#171717'], { card: { mode: 'cardless' }, effects: { enabled: ['grain'], intensity: 30 } }),
  ];
}

let cachedShowcase: Profile[] | null = null;

export function showcaseProfiles(): Profile[] {
  if (!cachedShowcase) cachedShowcase = buildShowcase();
  return cachedShowcase;
}

let cachedExtras: Profile[] | null = null;

export function extraProfiles(): Profile[] {
  if (!cachedExtras) cachedExtras = buildExtras();
  return cachedExtras;
}

export function allDemoProfiles(): Profile[] {
  return [...showcaseProfiles(), ...extraProfiles()];
}
