/* ------------------------------------------------------------------ */
/* Kloa.lol domain types                                               */
/* ------------------------------------------------------------------ */

export type Visibility = 'public' | 'unlisted' | 'private';

export type CardMode = 'card' | 'glass' | 'minimal' | 'cardless' | 'fullscreen';

export type BackgroundType = 'solid' | 'gradient' | 'animated-gradient' | 'image' | 'video';

export type EffectType =
  | 'stars'
  | 'snow'
  | 'particles'
  | 'gradientAnim'
  | 'grain'
  | 'vignette'
  | 'scanlines'
  | 'cursorGlow'
  | 'mouseLight';

export type HoverEffect = 'lift' | 'glow' | 'shine' | 'none';

export type SocialPlatform =
  | 'discord'
  | 'github'
  | 'youtube'
  | 'twitch'
  | 'x'
  | 'instagram'
  | 'tiktok'
  | 'spotify'
  | 'steam'
  | 'reddit'
  | 'telegram'
  | 'website';

export type BadgeId =
  | 'verified'
  | 'early'
  | 'supporter'
  | 'developer'
  | 'creator'
  | 'premium'
  | 'og';

/* ------------------------------ config ---------------------------- */

export interface GradientConfig {
  from: string;
  to: string;
  angle: number;
}

export interface ThemeConfig {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  card: string;
  border: string;
  glow: string;
}

export interface BackgroundConfig {
  type: BackgroundType;
  color: string;
  gradient: GradientConfig;
  imageUrl: string;
  videoUrl: string;
  /** image fine-tuning */
  blur: number; // px
  brightness: number; // %
  saturation: number; // %
  contrast: number; // %
  opacity: number; // %
  position: string; // css background-position
  scale: number; // %
  /** video fine-tuning */
  videoLoop: boolean;
  videoMuted: boolean;
  videoSpeed: number;
  videoOpacity: number; // %
  videoBlur: number; // px
  overlay: number; // % dark overlay for readability
}

export interface CardConfig {
  mode: CardMode;
  width: number; // px
  opacity: number; // %
  blur: number; // px backdrop
  borderWidth: number; // px
  borderColor: string;
  radius: number; // px
  shadow: number; // 0-100
  background: string;
  gradient: GradientConfig | null;
  padding: number; // px
}

export interface AvatarConfig {
  url: string;
  size: number; // px
  shape: 'circle' | 'rounded';
  radius: number; // px (used when shape = rounded)
  borderWidth: number;
  borderColor: string;
  glow: number; // 0-100
  shadow: number; // 0-100
}

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  /** direct URL (website) or handle for prefixed platforms */
  url: string;
  label: string; // display override
  hidden: boolean;
  order: number;
}

export interface CustomLink {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  color: string;
  gradient: GradientConfig | null;
  hover: HoverEffect;
  hidden: boolean;
  order: number;
}

export interface MusicConfig {
  enabled: boolean;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  volume: number; // 0-100
  loop: boolean;
  autoplay: boolean;
}

export interface IntroConfig {
  enabled: boolean;
  text: string;
  duration: number; // ms
  blur: boolean;
  fade: boolean;
  background: string;
}

export interface EffectsConfig {
  enabled: EffectType[];
  intensity: number; // 0-100
}

export interface Profile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  themeId: string;
  theme: ThemeConfig;
  background: BackgroundConfig;
  card: CardConfig;
  avatar: AvatarConfig;
  socials: SocialLink[];
  links: CustomLink[];
  music: MusicConfig;
  intro: IntroConfig;
  effects: EffectsConfig;
  badges: BadgeId[];
  visibility: Visibility;
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------ auth ------------------------------ */

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  isAdmin: boolean;
  createdAt: string;
}

/* ---------------------------- explore ----------------------------- */

export type ExploreSort = 'featured' | 'trending' | 'new' | 'popular';

export interface ExploreQuery {
  search?: string;
  sort: ExploreSort;
  page: number;
  pageSize: number;
}

export interface PublicProfileSummary {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  accent: string;
  backgroundCss: string;
  badges: BadgeId[];
  views: number;
  featured: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  total: number;
}

/* ---------------------------- analytics --------------------------- */

export interface DayPoint {
  date: string; // YYYY-MM-DD
  views: number;
  clicks: number;
}

export interface AnalyticsSummary {
  viewsToday: number;
  viewsWeek: number;
  viewsMonth: number;
  viewsTotal: number;
  clicksTotal: number;
  /** all-time unique visitors (device+day hash, privacy-preserving) */
  uniqueVisitors: number;
  /** today's unique visitors */
  uniqueToday: number;
  /** views today at UTC hour 0-23 (for live pulse chart) */
  hourlyToday: number[];
  /** device breakdown: key → count */
  devices: Record<string, number>;
  /** browser breakdown */
  browsers: Record<string, number>;
  /** referrer source breakdown */
  referrers: Record<string, number>;
  /** top visited paths/hostnames (aggregate, sanitized) */
  topSources: { title: string; views: number }[];
  topLinks: { title: string; clicks: number }[];
  daily: DayPoint[];
}

/* ------------------------------ admin ----------------------------- */

export interface AdminUserRow {
  id: string;
  email: string;
  username: string;
  displayName: string;
  suspended: boolean;
  badges: BadgeId[];
  views: number;
  visibility: Visibility;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  username: string;
  reason: string;
  details: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  totalProfiles: number;
  totalViews: number;
  totalClicks: number;
  openReports: number;
}

/* ----------------------------- backend ---------------------------- */

export type UploadKind = 'avatar' | 'cover' | 'background';

export interface Backend {
  readonly mode: 'demo' | 'supabase';
  auth: {
    getUser(): Promise<SessionUser | null>;
    signIn(email: string, password: string): Promise<SessionUser>;
    signUp(
      email: string,
      password: string,
      username: string
    ): Promise<{ needsVerification: boolean; user: SessionUser | null }>;
    signOut(): Promise<void>;
    sendPasswordReset(email: string): Promise<void>;
    updatePassword(newPassword: string): Promise<void>;
    onAuthChange(cb: (u: SessionUser | null) => void): () => void;
  };
  profiles: {
    getByUsername(username: string): Promise<Profile | null>;
    getOwn(): Promise<Profile | null>;
    ensureOwn(username: string): Promise<Profile>;
    saveOwn(p: Profile): Promise<void>;
    isUsernameAvailable(username: string): Promise<boolean>;
    listExplore(q: ExploreQuery): Promise<Paginated<PublicProfileSummary>>;
    deleteOwn(): Promise<void>;
  };
  uploads: {
    uploadImage(file: File, kind: UploadKind): Promise<string>;
    uploadAudio(file: File): Promise<string>;
  };
  analytics: {
    recordView(username: string): Promise<void>;
    recordClick(username: string, linkId: string, title: string): Promise<void>;
    getSummary(username: string): Promise<AnalyticsSummary>;
  };
  reports: {
    create(username: string, reason: string, details: string): Promise<void>;
  };
  admin: {
    isAdmin(): Promise<boolean>;
    listUsers(search: string, page: number): Promise<Paginated<AdminUserRow>>;
    setSuspended(userId: string, suspended: boolean): Promise<void>;
    deleteUser(userId: string): Promise<void>;
    banUsername(username: string): Promise<void>;
    grantBadge(userId: string, badge: BadgeId): Promise<void>;
    revokeBadge(userId: string, badge: BadgeId): Promise<void>;
    setFeatured(username: string, featured: boolean): Promise<void>;
    listReports(): Promise<ReportItem[]>;
    resolveReport(id: string, outcome: 'dismiss' | 'actioned'): Promise<void>;
    getStats(): Promise<SystemStats>;
    listBanned(): Promise<string[]>;
  };
}
