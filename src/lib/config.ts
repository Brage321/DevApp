import type {
  BadgeId,
  EffectType,
  SocialPlatform,
  ThemeConfig,
} from '@/types';

/* ------------------------------------------------------------------ */
/* Central, easily-editable site configuration                         */
/* ------------------------------------------------------------------ */

export const SITE = {
  name: 'Kloa.lol',
  tagline: 'Your links. Your vibe. Your page.',
  description:
    'Build a personal profile that feels like you: custom themes, music, links, and the little details that make your page yours.',
  url: (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://kloa.lol',
};

/**
 * Reserved usernames that can never be registered because they collide
 * with real routes / infrastructure paths. Configurable — the
 * registration validator and demo backend both read this list.
 */
export const RESERVED_USERNAMES: string[] = [
  'admin', 'api', 'dashboard', 'login', 'register', 'settings', 'explore',
  'pricing', 'features', 'support', 'help', 'privacy', 'terms', 'contact',
  'about', 'blog', 'careers', 'status', 'docs', 'legal', 'guidelines',
  'signin', 'signup', 'signout', 'logout', 'forgot-password', 'reset-password',
  'verify', '404', 'assets', 'static', 'public', 'sitemap.xml', 'robots.txt',
  'favicon.ico',
];

export const USERNAME_PATTERN = /^[a-z0-9_-]{3,24}$/;

export const FILE_LIMITS = {
  imageBytes: 5 * 1024 * 1024, // 5 MB
  audioBytes: 10 * 1024 * 1024, // 10 MB
  videoBytes: 25 * 1024 * 1024, // 25 MB
  bioMax: 500,
  displayNameMax: 32,
  linksMax: 24,
  socialsMax: 12,
};

/* ------------------------------ themes ---------------------------- */

export interface ThemePreset {
  id: string;
  label: string;
  theme: ThemeConfig;
  /** css gradient preview for pickers/showcase */
  preview: string;
}

const t = (
  id: string,
  label: string,
  background: string,
  accent: string,
  secondary: string,
  preview: string
): ThemePreset => ({
  id,
  label,
  preview,
  theme: {
    background,
    primary: accent,
    secondary,
    accent,
    text: '#EDEDF2',
    card: 'rgba(255,255,255,0.045)',
    border: 'rgba(255,255,255,0.1)',
    glow: accent,
  },
});

export const BUILT_IN_THEMES: ThemePreset[] = [
  t('midnight', 'Midnight', '#0A0A14', '#8B5CF6', '#A78BFA',
    'linear-gradient(135deg,#0A0A14,#1b1440,#8B5CF6)'),
  t('void', 'Void', '#050505', '#EDEDF2', '#9B9BA8',
    'linear-gradient(135deg,#050505,#232323,#EDEDF2)'),
  t('aurora', 'Aurora', '#06111A', '#34D399', '#60A5FA',
    'linear-gradient(135deg,#06111A,#0b3b3c,#34D399,#60A5FA)'),
  t('neon', 'Neon', '#0D0214', '#F472B6', '#A78BFA',
    'linear-gradient(135deg,#0D0214,#3b0d34,#F472B6)'),
  t('ocean', 'Ocean', '#020D1A', '#38BDF8', '#818CF8',
    'linear-gradient(135deg,#020D1A,#0b3a5e,#38BDF8)'),
  t('crimson', 'Crimson', '#120404', '#F87171', '#FCA5A5',
    'linear-gradient(135deg,#120404,#4c0f0f,#F87171)'),
  t('lavender', 'Lavender', '#0F0A18', '#C4B5FD', '#A78BFA',
    'linear-gradient(135deg,#0F0A18,#2e2350,#C4B5FD)'),
  t('monochrome', 'Monochrome', '#0B0B0B', '#FAFAFA', '#A3A3A3',
    'linear-gradient(135deg,#0B0B0B,#404040,#FAFAFA)'),
  t('cyber', 'Cyber', '#050A0F', '#22D3EE', '#818CF8',
    'linear-gradient(135deg,#050A0F,#083344,#22D3EE)'),
  t('minimal', 'Minimal', '#0A0A0A', '#FFFFFF', '#D4D4D8',
    'linear-gradient(135deg,#0A0A0A,#2a2a2a,#FFFFFF)'),
];

export const DEFAULT_THEME = BUILT_IN_THEMES[0];

/* --------------------------- social links ------------------------- */

export interface SocialPlatformMeta {
  label: string;
  /** prefix applied to user handles; '' = full URL required */
  prefix: string;
  placeholder: string;
  color: string;
}

export const SOCIAL_PLATFORMS: Record<SocialPlatform, SocialPlatformMeta> = {
  discord: { label: 'Discord', prefix: '', placeholder: 'username', color: '#5865F2' },
  github: { label: 'GitHub', prefix: 'https://github.com/', placeholder: 'username', color: '#EDEDF2' },
  youtube: { label: 'YouTube', prefix: 'https://youtube.com/@', placeholder: 'handle', color: '#FF4444' },
  twitch: { label: 'Twitch', prefix: 'https://twitch.tv/', placeholder: 'username', color: '#9146FF' },
  x: { label: 'X', prefix: 'https://x.com/', placeholder: 'username', color: '#EDEDF2' },
  instagram: { label: 'Instagram', prefix: 'https://instagram.com/', placeholder: 'username', color: '#E1306C' },
  tiktok: { label: 'TikTok', prefix: 'https://tiktok.com/@', placeholder: 'username', color: '#FE2C55' },
  spotify: { label: 'Spotify', prefix: 'https://open.spotify.com/user/', placeholder: 'user id', color: '#1DB954' },
  steam: { label: 'Steam', prefix: 'https://steamcommunity.com/id/', placeholder: 'custom id', color: '#66C0F4' },
  reddit: { label: 'Reddit', prefix: 'https://reddit.com/user/', placeholder: 'username', color: '#FF4500' },
  telegram: { label: 'Telegram', prefix: 'https://t.me/', placeholder: 'username', color: '#229ED9' },
  website: { label: 'Website', prefix: '', placeholder: 'https://yoursite.com', color: '#8B5CF6' },
};

export const SOCIAL_ORDER: SocialPlatform[] = [
  'discord', 'github', 'youtube', 'twitch', 'x', 'instagram',
  'tiktok', 'spotify', 'steam', 'reddit', 'telegram', 'website',
];

/* ------------------------------ badges ---------------------------- */

export const BADGES: Record<BadgeId, { label: string; emoji: string; color: string }> = {
  verified: { label: 'Verified', emoji: '✓', color: '#38BDF8' },
  early: { label: 'Early User', emoji: '🌱', color: '#34D399' },
  supporter: { label: 'Supporter', emoji: '♥', color: '#F472B6' },
  developer: { label: 'Developer', emoji: '⌨', color: '#A78BFA' },
  creator: { label: 'Creator', emoji: '✦', color: '#FBBF24' },
  premium: { label: 'Premium', emoji: '◆', color: '#F59E0B' },
  og: { label: 'OG', emoji: '♛', color: '#8B5CF6' },
};

/* ----------------------------- effects ---------------------------- */

export interface EffectMeta {
  id: EffectType;
  label: string;
  description: string;
  /** canvas-animated and heavier */
  animated: boolean;
}

export const EFFECT_CATALOG: EffectMeta[] = [
  { id: 'stars', label: 'Stars', description: 'A calm field of twinkling stars', animated: true },
  { id: 'snow', label: 'Snow', description: 'Soft falling snowflakes', animated: true },
  { id: 'particles', label: 'Particles', description: 'Floating connected particles', animated: true },
  { id: 'gradientAnim', label: 'Gradient Motion', description: 'Slowly shifting background gradient', animated: false },
  { id: 'grain', label: 'Grain', description: 'Subtle film grain texture', animated: false },
  { id: 'vignette', label: 'Vignette', description: 'Darkened edges for focus', animated: false },
  { id: 'scanlines', label: 'Scanlines', description: 'Retro CRT scanline overlay', animated: false },
  { id: 'cursorGlow', label: 'Cursor Glow', description: 'Light follows the cursor', animated: true },
  { id: 'mouseLight', label: 'Mouse Light', description: 'Wide ambient light on the page', animated: true },
];

/* ----------------------------- pricing ---------------------------- */

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  highlight?: boolean;
  features: string[];
  cta: string;
}

/**
 * Pricing lives here so it can be changed without touching components.
 * NOTE: no payment processing is implemented — upgrading is intentionally
 * a "contact us" flow until a payment provider is integrated.
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'A simple profile that feels like yours, without the extra fuss.',
    features: [
      'Your own kloa.lol/username',
      'All 10 built-in themes',
      'Up to 8 links',
      'Social profiles and contact links',
      'Background controls',
      'A couple of visual effects',
      'Basic analytics for the last 30 days',
    ],
    cta: 'Start free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$4',
    period: 'per month',
    description: 'For people who want their page to feel a little more like them.',
    highlight: true,
    features: [
      'Everything in Free',
      'Unlimited links',
      'Custom backgrounds and video',
      'All effects and intensity controls',
      'Background music and intro screen',
      'Better analytics and a fuller picture',
      'Profile badges and extra polish',
    ],
    cta: 'Go Pro',
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: '$9',
    period: 'per month',
    description: 'For creators, founders, and people with a bigger online footprint.',
    features: [
      'Everything in Pro',
      'Custom domain support',
      'Priority help and faster replies',
      'Early access to new features',
      'Exclusive OG badge',
      'More advanced theme controls',
      'API access coming soon',
    ],
    cta: 'Get Ultimate',
  },
];

/* ------------------------------ misc ------------------------------ */

/** Demo-mode admin account (demo backend only — NOT a real credential). */
export const DEMO_ADMIN_EMAIL = 'admin@kloa.lol';
export const DEMO_ADMIN_PASSWORD = 'kloa-admin';

/** Stable sample audio for demo profiles (public test MP3s). */
export const DEMO_TRACK_URLS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
];
