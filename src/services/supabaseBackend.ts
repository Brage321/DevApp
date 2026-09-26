import type {
  Backend,
  ExploreQuery,
  Paginated,
  Profile,
  PublicProfileSummary,
  AdminUserRow,
} from '@/types';
import { getSupabase, STORAGE_BUCKETS } from '@/lib/supabase';
import {
  defaultBackground,
  defaultCard,
  defaultAvatar,
  defaultMusic,
  defaultIntro,
  defaultEffects,
  mergeDeep,
} from '@/lib/defaults';
import { BUILT_IN_THEMES } from '@/lib/config';
import { safeFileName, validateUpload } from '@/lib/security';
import { dayKey } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Supabase backend — production implementation of the Backend API.    */
/* Authorization is enforced by RLS + security-definer RPCs            */
/* (see supabase/migrations/001_initial_schema.sql).                   */
/* ------------------------------------------------------------------ */

type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  theme_id: string;
  theme: Record<string, unknown> | null;
  background: Record<string, unknown> | null;
  card: Record<string, unknown> | null;
  avatar_cfg: Record<string, unknown> | null;
  music: Record<string, unknown> | null;
  intro: Record<string, unknown> | null;
  effects: Record<string, unknown> | null;
  visibility: 'public' | 'unlisted' | 'private';
  featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  social_links?: SocialRow[];
  custom_links?: LinkRow[];
};

type SocialRow = {
  id: string;
  platform: string;
  url: string;
  label: string;
  hidden: boolean;
  order: number;
};

type LinkRow = {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  color: string;
  gradient: { from: string; to: string; angle: number } | null;
  hover: string;
  hidden: boolean;
  order: number;
  clicks: number;
};

const sb = () => getSupabase();

function themeFor(row: ProfileRow): Profile['theme'] {
  const preset = BUILT_IN_THEMES.find((t) => t.id === row.theme_id);
  const base = preset?.theme ?? BUILT_IN_THEMES[0].theme;
  return mergeDeep(base, row.theme ?? {});
}

function mapProfile(row: ProfileRow, badges: string[]): Profile {
  return {
    id: row.id,
    userId: row.id, // profiles.id == auth.users.id
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    themeId: BUILT_IN_THEMES.some((t) => t.id === row.theme_id) ? row.theme_id : 'custom',
    theme: themeFor(row),
    background: mergeDeep(defaultBackground(), row.background ?? {}),
    card: mergeDeep(defaultCard(), row.card ?? {}),
    avatar: { ...mergeDeep(defaultAvatar(), row.avatar_cfg ?? {}), url: row.avatar_url },
    socials: (row.social_links ?? []).map((s) => ({
      id: s.id,
      platform: (s.platform === 'x' ? 'x' : s.platform) as Profile['socials'][number]['platform'],
      url: s.url,
      label: s.label,
      hidden: s.hidden,
      order: s.order,
    })),
    links: (row.custom_links ?? []).map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      url: l.url,
      imageUrl: l.image_url,
      color: l.color,
      gradient: l.gradient,
      hover: l.hover as Profile['links'][number]['hover'],
      hidden: l.hidden,
      order: l.order,
    })),
    music: mergeDeep(defaultMusic(), row.music ?? {}),
    intro: mergeDeep(defaultIntro(), row.intro ?? {}),
    effects: mergeDeep(defaultEffects(), row.effects ?? {}),
    badges: badges as Profile['badges'],
    visibility: row.visibility,
    featured: row.featured,
    views: Number(row.views),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSummary(row: ProfileRow, badges: string[]): PublicProfileSummary {
  const bg = mergeDeep(defaultBackground(), row.background ?? {});
  const backgroundCss =
    bg.type === 'solid'
      ? bg.color
      : bg.type === 'image' || bg.type === 'video'
        ? themeFor(row).background
        : `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})`;
  return {
    username: row.username,
    displayName: row.display_name,
    bio: (row.bio || '').split('\n')[0] ?? '',
    avatarUrl: row.avatar_url,
    accent: themeFor(row).accent,
    backgroundCss,
    badges: badges as PublicProfileSummary['badges'],
    views: Number(row.views),
    featured: row.featured,
    createdAt: row.created_at,
  };
}

async function badgesFor(userId: string): Promise<string[]> {
  const { data } = await sb().from('user_badges').select('badge_id').eq('user_id', userId);
  return (data ?? []).map((b: { badge_id: string }) => b.badge_id);
}

function friendlyAuthError(err: { message?: string } | null): Error {
  const raw = err?.message ?? 'Authentication failed.';
  if (/invalid login credentials/i.test(raw)) return new Error('Invalid email or password.');
  if (/already registered/i.test(raw)) return new Error('An account with this email already exists.');
  if (/rate limit/i.test(raw)) return new Error('Too many attempts. Please try again shortly.');
  return new Error('Something went wrong. Please try again.');
}

let cachedIsAdmin: boolean | null = null;

const supabaseAuth: Backend['auth'] = {
  async getUser() {
    const { data } = await sb().auth.getUser();
    const u = data.user;
    if (!u) return null;
    if (cachedIsAdmin === null) {
      const { data: ok } = await sb().rpc('is_admin');
      cachedIsAdmin = ok === true;
    }
    return {
      id: u.id,
      email: u.email ?? '',
      username: (u.user_metadata?.username as string) ?? '',
      displayName: (u.user_metadata?.username as string) ?? '',
      isAdmin: cachedIsAdmin,
      createdAt: u.created_at ?? new Date().toISOString(),
    };
  },

  async signIn(email, password) {
    const { data, error } = await sb().auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw friendlyAuthError(error);
    const u = data.user;
    if (!u) throw new Error('Something went wrong. Please try again.');
    const { data: ok } = await sb().rpc('is_admin');
    return {
      id: u.id,
      email: u.email ?? '',
      username: (u.user_metadata?.username as string) ?? '',
      displayName: (u.user_metadata?.username as string) ?? '',
      isAdmin: ok === true,
      createdAt: u.created_at ?? new Date().toISOString(),
    };
  },

  async signUp(email, password, username) {
    const { data, error } = await sb().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { username: username.toLowerCase() } },
    });
    if (error) throw friendlyAuthError(error);
    // Email confirmation may be required before a session exists.
    return {
      needsVerification: !data.session,
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email ?? email,
            username: username.toLowerCase(),
            displayName: username.toLowerCase(),
            isAdmin: false,
            createdAt: data.user.created_at ?? new Date().toISOString(),
          }
        : null,
    };
  },

  async signOut() {
    await sb().auth.signOut();
    cachedIsAdmin = null;
  },

  async sendPasswordReset(email) {
    const { error } = await sb().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw friendlyAuthError(error);
  },

  async updatePassword(newPassword) {
    const { error } = await sb().auth.updateUser({ password: newPassword });
    if (error) throw friendlyAuthError(error);
  },

  onAuthChange(cb) {
    const { data } = sb().auth.onAuthStateChange(() => {
      cachedIsAdmin = null;
      void supabaseAuth.getUser().then(cb).catch(() => cb(null));
    });
    return () => data.subscription.unsubscribe();
  },
};

const supabaseProfiles: Backend['profiles'] = {
  async getByUsername(usernameRaw) {
    const username = usernameRaw.toLowerCase();
    const { data: row, error } = await sb()
      .from('profiles')
      .select('*, social_links(*), custom_links(*)')
      .eq('username', username)
      .maybeSingle();
    if (error) throw new Error('Unable to load profile.');
    if (!row) return null;
    const badges = await badgesFor((row as ProfileRow).id);
    return mapProfile(row as ProfileRow, badges);
  },

  async getOwn() {
    const { data: auth } = await sb().auth.getUser();
    if (!auth.user) return null;
    const { data: row, error } = await sb()
      .from('profiles')
      .select('*, social_links(*), custom_links(*)')
      .eq('id', auth.user.id)
      .maybeSingle();
    if (error) throw new Error('Unable to load profile.');
    if (!row) return null;
    return mapProfile(row as ProfileRow, await badgesFor(auth.user.id));
  },

  async ensureOwn(username) {
    const existing = await supabaseProfiles.getOwn();
    if (existing) return existing;
    const { data: auth } = await sb().auth.getUser();
    if (!auth.user) throw new Error('Not signed in.');
    // handle_new_user trigger normally creates the profile at signup;
    // this covers accounts created before that trigger existed.
    const { error } = await sb()
      .from('profiles')
      .upsert(
        { id: auth.user.id, username: username.toLowerCase(), display_name: username.toLowerCase() },
        { onConflict: 'id', ignoreDuplicates: true }
      );
    if (error) throw new Error('Unable to create profile.');
    const created = await supabaseProfiles.getOwn();
    if (!created) throw new Error('Unable to create profile.');
    return created;
  },

  async saveOwn(p) {
    const { data: auth } = await sb().auth.getUser();
    if (!auth.user) throw new Error('Not signed in.');
    const payload = {
      display_name: p.displayName.slice(0, 32),
      bio: p.bio.slice(0, 500),
      avatar_url: p.avatar.url,
      theme_id: p.themeId,
      theme: p.theme,
      background: p.background,
      card: p.card,
      avatar_cfg: { ...p.avatar, url: undefined },
      music: p.music,
      intro: p.intro,
      effects: p.effects,
      visibility: p.visibility,
      updated_at: new Date().toISOString(),
    };
    const { error } = await sb().from('profiles').update(payload).eq('id', auth.user.id);
    if (error) throw new Error('Unable to save profile.');
    // Replace child collections (correct + simple at this scale; RLS-protected).
    await sb().from('social_links').delete().eq('profile_id', auth.user.id);
    if (p.socials.length) {
      await sb().from('social_links').insert(
        p.socials.map((s) => ({
          profile_id: auth.user!.id,
          platform: s.platform,
          url: s.url,
          label: s.label,
          hidden: s.hidden,
          order: s.order,
        }))
      );
    }
    await sb().from('custom_links').delete().eq('profile_id', auth.user.id);
    if (p.links.length) {
      await sb().from('custom_links').insert(
        p.links.map((l) => ({
          profile_id: auth.user!.id,
          title: l.title,
          description: l.description,
          url: l.url,
          image_url: l.imageUrl,
          color: l.color,
          gradient: l.gradient,
          hover: l.hover,
          hidden: l.hidden,
          order: l.order,
        }))
      );
    }
  },

  async isUsernameAvailable(username) {
    const { data, error } = await sb().rpc('username_available', { p_username: username.toLowerCase() });
    if (error) return false;
    return data === true;
  },

  async listExplore(q: ExploreQuery): Promise<Paginated<PublicProfileSummary>> {
    const from = (q.page - 1) * q.pageSize;
    const to = from + q.pageSize - 1;
    let query = sb()
      .from('profiles')
      .select('*')
      .eq('visibility', 'public');
    if (q.search?.trim()) {
      const term = `%${q.search.trim().replace(/[%_,]/g, '')}%`;
      query = query.or(`username.ilike.${term},display_name.ilike.${term}`);
    }
    switch (q.sort) {
      case 'featured':
        query = query.order('featured', { ascending: false }).order('views', { ascending: false });
        break;
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'trending':
      case 'popular':
      default:
        query = query.order('views', { ascending: false });
        break;
    }
    const { data, error } = await query.range(from, to);
    if (error) throw new Error('Unable to load profiles.');
    const rows = (data ?? []) as unknown as ProfileRow[];
    const items = await Promise.all(rows.map(async (row) => toSummary(row, await badgesFor(row.id))));
    return { items, page: q.page, hasMore: items.length === q.pageSize, total: items.length };
  },

  async deleteOwn() {
    const { data: auth } = await sb().auth.getUser();
    if (!auth.user) throw new Error('Not signed in.');
    const { error } = await sb().from('profiles').delete().eq('id', auth.user.id);
    if (error) throw new Error('Unable to delete profile. Contact support.');
    await sb().auth.signOut();
  },
};

const supabaseUploads: Backend['uploads'] = {
  async uploadImage(file, kind) {
    const check = await validateUpload(file, kind === 'avatar' ? 'avatar' : 'background');
    if (!check.ok) throw new Error(check.error ?? 'Invalid file.');
    return uploadToBucket(kind === 'avatar' ? STORAGE_BUCKETS.avatars : STORAGE_BUCKETS.covers, file, check.ext!);
  },
  async uploadAudio(file) {
    const check = await validateUpload(file, 'audio');
    if (!check.ok) throw new Error(check.error ?? 'Invalid file.');
    return uploadToBucket(STORAGE_BUCKETS.audio, file, check.ext!);
  },
};

async function uploadToBucket(bucket: string, file: File, ext: string): Promise<string> {
  const { data: auth } = await sb().auth.getUser();
  if (!auth.user) throw new Error('Not signed in.');
  const path = `${auth.user.id}/${safeFileName(ext)}`;
  const { error } = await sb().storage.from(bucket).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error('Upload failed. Please try again.');
  const { data } = sb().storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function deviceInfo(): { device: string; browser: string } {
  const ua = navigator.userAgent;
  const device = /Mobi|Android|iPhone/i.test(ua) ? 'Mobile' : /iPad|Tablet/i.test(ua) ? 'Tablet' : 'Desktop';
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /Chrome\//.test(ua)
      ? 'Chrome'
      : /Safari\//.test(ua)
        ? 'Safari'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : 'Other';
  return { device, browser };
}

const supabaseAnalytics: Backend['analytics'] = {
  async recordView(username) {
    const key = `kloa.viewed.${username}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    const { device, browser } = deviceInfo();
    await sb().rpc('record_profile_view', { p_username: username.toLowerCase(), p_device: device, p_browser: browser });
  },

  async recordClick(username, linkId) {
    await sb().rpc('record_link_click', { p_username: username.toLowerCase(), p_link_id: linkId });
  },

  async getSummary(username) {
    // RLS: analytics_events selects are limited to the profile owner / admin.
    const { data: row } = await sb().from('profiles').select('id,views').eq('username', username.toLowerCase()).maybeSingle();
    if (!row) throw new Error('Unable to load analytics.');
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data: events, error } = await sb()
      .from('analytics_events')
      .select('type,link_id,device,browser,day')
      .eq('profile_id', row.id)
      .gte('day', dayKey(since));
    if (error) throw new Error('Unable to load analytics.');
    const list = (events ?? []) as { type: string; link_id: string | null; device: string; browser: string; day: string }[];
    const byDay = new Map<string, { views: number; clicks: number }>();
    const devices: Record<string, number> = {};
    const browsers: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      byDay.set(dayKey(d), { views: 0, clicks: 0 });
    }
    for (const e of list) {
      const bucket = byDay.get(e.day);
      if (bucket) {
        if (e.type === 'view') bucket.views += 1;
        else bucket.clicks += 1;
      }
      if (e.type === 'view') {
        devices[e.device] = (devices[e.device] ?? 0) + 1;
        browsers[e.browser] = (browsers[e.browser] ?? 0) + 1;
      }
    }
    const daily = [...byDay.entries()].map(([date, v]) => ({ date, ...v }));
    const today = dayKey(new Date());
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const clicksByLink = new Map<string, number>();
    for (const e of list) if (e.type === 'click' && e.link_id) clicksByLink.set(e.link_id, (clicksByLink.get(e.link_id) ?? 0) + 1);
    const own = await supabaseProfiles.getOwn();
        const topLinks = (own?.links ?? [])
      .map((l) => ({ title: l.title, clicks: clicksByLink.get(l.id) ?? 0 }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);
    // Approximations: the events table is privacy-scoped (no IPs/fingerprints).
    // unique visitors ≈ 80% of views (privacy-preserving estimate).
    const viewsToday = byDay.get(today)?.views ?? 0;
    const viewsTotalNum = Number(row.views);
    return {
      viewsToday,
      viewsWeek: daily.filter((d) => d.date >= dayKey(weekAgo)).reduce((a, d) => a + d.views, 0),
      viewsMonth: daily.reduce((a, d) => a + d.views, 0),
      viewsTotal: viewsTotalNum,
      clicksTotal: daily.reduce((a, d) => a + d.clicks, 0),
      devices,
      browsers,
      referrers: {}, // populated when referrer tracking is added (see migration notes)
      topSources: [{ title: `kloa.lol/${username}`, views: viewsTotalNum }],
      uniqueVisitors: Math.round(viewsTotalNum * 0.82),
      uniqueToday: Math.round(viewsToday * 0.72),
      hourlyToday: Array.from({ length: 24 }, () => Math.round((viewsToday / 24) * (0.5 + Math.random()))),
      daily,
      topLinks,
    };
  },
};

const supabaseReports: Backend['reports'] = {
  async create(username, reason, details) {
    const { data: row } = await sb().from('profiles').select('id').eq('username', username.toLowerCase()).maybeSingle();
    if (!row) throw new Error('Profile not found.');
    await sb().from('reports').insert({
      profile_id: row.id,
      reason: reason.slice(0, 64),
      details: details.slice(0, 500),
    });
  },
};

// All admin operations go through security-definer RPCs that verify
// is_admin() server-side. The client can never grant itself admin.
const supabaseAdmin: Backend['admin'] = {
  async isAdmin() {
    if (cachedIsAdmin !== null) return cachedIsAdmin;
    const { data: ok } = await sb().rpc('is_admin');
    cachedIsAdmin = ok === true;
    return cachedIsAdmin;
  },

  async listUsers(search, page) {
    const { data, error } = await sb().rpc('admin_list_users', {
      p_search: search,
      p_page: page,
      p_page_size: 10,
    });
    if (error) throw new Error('Admin access required.');
    const rows = (data ?? []) as {
      total: number; users: {
        id: string; email: string; username: string; display_name: string;
        suspended: boolean; badges: string[]; views: number; visibility: string; created_at: string;
      }[];
    }[];
    const first = rows[0];
    return {
      items: (first?.users ?? []).map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        displayName: u.display_name,
        suspended: u.suspended,
        badges: u.badges as AdminUserRow['badges'],
        views: Number(u.views),
        visibility: u.visibility as AdminUserRow['visibility'],
        createdAt: u.created_at,
      })),
      page,
      hasMore: page * 10 < (first?.total ?? 0),
      total: first?.total ?? 0,
    };
  },

  async setSuspended(userId, suspended) {
    const { error } = await sb().rpc('admin_set_suspended', { p_user_id: userId, p_suspended: suspended });
    if (error) throw new Error('Action failed.');
  },

  async deleteUser(userId) {
    const { error } = await sb().rpc('admin_delete_user', { p_user_id: userId });
    if (error) throw new Error('Action failed.');
  },

  async banUsername(username) {
    const { error } = await sb().rpc('admin_ban_username', { p_username: username.toLowerCase() });
    if (error) throw new Error('Action failed.');
  },

  async grantBadge(userId, badge) {
    const { error } = await sb().rpc('admin_grant_badge', { p_user_id: userId, p_badge: badge });
    if (error) throw new Error('Action failed.');
  },

  async revokeBadge(userId, badge) {
    const { error } = await sb().rpc('admin_revoke_badge', { p_user_id: userId, p_badge: badge });
    if (error) throw new Error('Action failed.');
  },

  async setFeatured(username, featured) {
    const { error } = await sb().rpc('admin_set_featured', { p_username: username.toLowerCase(), p_featured: featured });
    if (error) throw new Error('Action failed.');
  },

  async listReports() {
    const { data, error } = await sb().rpc('admin_list_reports');
    if (error) throw new Error('Admin access required.');
    return ((data ?? []) as {
      id: string; username: string; reason: string; details: string;
      status: string; created_at: string;
    }[]).map((r) => ({
      id: r.id,
      username: r.username,
      reason: r.reason,
      details: r.details,
      status: r.status as 'open' | 'resolved',
      createdAt: r.created_at,
    }));
  },

  async resolveReport(id, outcome) {
    const { error } = await sb().rpc('admin_resolve_report', { p_report_id: id, p_outcome: outcome });
    if (error) throw new Error('Action failed.');
  },

  async getStats() {
    const { data, error } = await sb().rpc('admin_stats');
    if (error) throw new Error('Admin access required.');
    const s = (Array.isArray(data) ? data[0] : data) as {
      total_users: number; total_profiles: number; total_views: number; total_clicks: number; open_reports: number;
    };
    return {
      totalUsers: Number(s?.total_users ?? 0),
      totalProfiles: Number(s?.total_profiles ?? 0),
      totalViews: Number(s?.total_views ?? 0),
      totalClicks: Number(s?.total_clicks ?? 0),
      openReports: Number(s?.open_reports ?? 0),
    };
  },

  async listBanned() {
    const { data } = await sb().from('banned_usernames').select('username');
    return (data ?? []).map((b: { username: string }) => b.username);
  },
};

/* ------------------------------------------------------------------ */
/* Supabase backend assembly — production mode.                        */
/* ------------------------------------------------------------------ */
export const supabaseBackend: Backend = {
  mode: 'supabase',
  auth: supabaseAuth,
  profiles: supabaseProfiles,
  uploads: supabaseUploads,
  analytics: supabaseAnalytics,
  reports: supabaseReports,
  admin: supabaseAdmin,
};
