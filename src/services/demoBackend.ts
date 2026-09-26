import type {
  AdminUserRow,
  AnalyticsSummary,
  Backend,
  ExploreQuery,
  Profile,
  PublicProfileSummary,
  ReportItem,
  SessionUser,
} from '@/types';
import { DEMO_ADMIN_EMAIL, RESERVED_USERNAMES } from '@/lib/config';
import { allDemoProfiles, demoCreatedAt, demoViews } from '@/lib/demoSeed';
import { defaultProfile, mergeDeep } from '@/lib/defaults';
import { normalizeUsername, usernameError } from '@/lib/security';
import { dayKey, hashSeed, mulberry32, uid } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* DEMO BACKEND — browser-local implementation of the Backend API.     */
/*                                                                     */
/* ⚠️  DEMO ONLY. Data lives in localStorage; auth is simulated.        */
/* It exists so the static build works on Surge without credentials.   */
/* Configure Supabase env vars to switch to the real backend.          */
/* ------------------------------------------------------------------ */

interface DemoUser {
  id: string;
  email: string;
  passHash: string;
  username: string;
  displayName: string;
  suspended: boolean;
  createdAt: string;
}

const K = {
  users: 'kloa.demo.users',
  profiles: 'kloa.demo.profiles',
  session: 'kloa.demo.session',
  reports: 'kloa.demo.reports',
  banned: 'kloa.demo.banned',
  views: 'kloa.demo.views',
  clicks: 'kloa.demo.clicks',
  seeded: 'kloa.demo.seeded',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function resetDemoData(): void {
  Object.values(K).forEach((k) => localStorage.removeItem(k));
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function seedOnce(): void {
  if (localStorage.getItem(K.seeded)) return;
  const profiles = allDemoProfiles();
  const users: DemoUser[] = profiles.map((p) => ({
    id: p.userId,
    email: `${p.username}@demo.kloa.lol`,
    passHash: '',
    username: p.username,
    displayName: p.displayName,
    suspended: false,
    createdAt: demoCreatedAt(p.username),
  }));
  users.push({
    id: 'demo-user-admin',
    email: DEMO_ADMIN_EMAIL,
    passHash: '',
    username: 'kloa-admin',
    displayName: 'Kloa Team',
    suspended: false,
    createdAt: '2024-01-01T00:00:00Z',
  });
  write(K.users, users);
  write(K.profiles, profiles);
  write(K.reports, seedReports());
  write(K.banned, ['hacker', 'phisher']);
  write(K.views, {});
  write(K.clicks, {});
  localStorage.setItem(K.seeded, '1');
}

function seedReports(): ReportItem[] {
  return [
    {
      id: uid(), username: 'vex', reason: 'Spam', details: 'Link card points to a repeated ad site.',
      status: 'open', createdAt: new Date(Date.now() - 3600e3 * 5).toISOString(),
    },
    {
      id: uid(), username: 'mira', reason: 'Impersonation', details: 'Claiming to be a known artist.',
      status: 'open', createdAt: new Date(Date.now() - 3600e3 * 26).toISOString(),
    },
  ];
}

function users(): DemoUser[] {
  return read<DemoUser[]>(K.users, []);
}

function profiles(): Profile[] {
  return read<Profile[]>(K.profiles, []);
}

function saveProfiles(list: Profile[]): void {
  write(K.profiles, list);
}

function toSessionUser(u: DemoUser): SessionUser {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    displayName: u.displayName,
    isAdmin: u.email === DEMO_ADMIN_EMAIL,
    createdAt: u.createdAt,
  };
}

const AUTH_EVENT = 'kloa:demo-auth';

function currentUser(): SessionUser | null {
  const id = read<string | null>(K.session, null);
  if (!id) return null;
  const u = users().find((x) => x.id === id);
  return u ? toSessionUser(u) : null;
}

function requireUser(): SessionUser {
  const u = currentUser();
  if (!u) throw new Error('Not signed in.');
  return u;
}

function visibleToViewer(p: Profile, viewer: SessionUser | null): boolean {
  if (p.visibility === 'private') {
    return viewer !== null && (viewer.id === p.userId || viewer.isAdmin);
  }
  const owner = users().find((x) => x.id === p.userId);
  return !owner?.suspended;
}

function toSummary(p: Profile): PublicProfileSummary {
  const bg = p.background;
  const backgroundCss =
    bg.type === 'solid'
      ? bg.color
      : bg.type === 'image' || bg.type === 'video'
        ? p.theme.background
        : `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})`;
  return {
    username: p.username,
    displayName: p.displayName,
    bio: p.bio.split('\n')[0] ?? '',
    avatarUrl: p.avatar.url,
    accent: p.theme.accent,
    backgroundCss,
    badges: p.badges,
    views: demoViews(p.username),
    featured: p.featured,
    createdAt: demoCreatedAt(p.username),
  };
}

function sortProfiles(list: Profile[], sort: ExploreQuery['sort']): Profile[] {
  const arr = [...list];
  switch (sort) {
    case 'featured':
      return arr.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || demoViews(b.username) - demoViews(a.username)
      );
    case 'trending':
      return arr.sort((a, b) => demoViews(b.username) % 1000 - demoViews(a.username) % 1000 || demoViews(b.username) - demoViews(a.username));
    case 'new':
      return arr.sort((a, b) => demoCreatedAt(b.username).localeCompare(demoCreatedAt(a.username)));
    case 'popular':
      return arr.sort((a, b) => demoViews(b.username) - demoViews(a.username));
  }
}

function seededAnalytics(username: string): AnalyticsSummary {
  const rand = mulberry32(hashSeed(username));
  const daily: AnalyticsSummary['daily'] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const base = 40 + rand() * 90 + (weekend ? 25 : 0);
    const growth = 1 + (29 - i) * 0.02;
    const views = Math.round(base * growth);
    daily.push({ date: dayKey(d), views, clicks: Math.round(views * (0.1 + rand() * 0.15)) });
  }
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const views = daily.map((d) => d.views);
  const clicks = daily.map((d) => d.clicks);
  const viewsTotal = sum(views) + Math.round(sum(views) * 2.2);
  const clicksTotal = sum(clicks) + Math.round(sum(clicks) * 2.0);
  const todayViews = views[views.length - 1] ?? 0;
  return {
    viewsToday: todayViews,
    viewsWeek: sum(views.slice(-7)),
    viewsMonth: sum(views),
    viewsTotal,
    clicksTotal,
    devices: { Desktop: 58 + Math.round(rand() * 10), Mobile: 30 + Math.round(rand() * 8), Tablet: 4 + Math.round(rand() * 4) },
    browsers: { Chrome: 52 + Math.round(rand() * 10), Safari: 18 + Math.round(rand() * 8), Firefox: 9 + Math.round(rand() * 5), Edge: 7 + Math.round(rand() * 4), Other: 3 + Math.round(rand() * 3) },
    referrers: { Direct: 42 + Math.round(rand() * 10), 'X / Twitter': 14 + Math.round(rand() * 6), Discord: 11 + Math.round(rand() * 5), Search: 8 + Math.round(rand() * 4), Other: 8 + Math.round(rand() * 4) },
    topSources: [
      { title: 'kloa.lol/' + username, views: viewsTotal },
      { title: 'Direct', views: Math.round(viewsTotal * 0.38) },
      { title: 'X / Twitter', views: Math.round(viewsTotal * 0.18) },
    ],
    uniqueVisitors: Math.round(sum(views) * 0.82),
    uniqueToday: Math.round(todayViews * 0.72),
    hourlyToday: Array.from({ length: 24 }, () => Math.round(rand() * (todayViews || 1) * 0.15)),
    daily,
    topLinks: [],
  };
}

function recordedViews(username: string): Record<string, number> {
  return read<Record<string, Record<string, number>>>(K.views, {})[username] ?? {};
}

const demoAuth: Backend['auth'] = {
  async getUser() {
    seedOnce();
    return currentUser();
  },

  async signIn(email, password) {
    seedOnce();
    const u = users().find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) throw new Error('Invalid email or password.');
    if (u.passHash) {
      const hash = await sha256(password);
      if (hash !== u.passHash) throw new Error('Invalid email or password.');
    } else if (u.email === DEMO_ADMIN_EMAIL) {
      if (password !== 'kloa-admin') throw new Error('Invalid email or password.');
    } else {
      throw new Error('Invalid email or password.');
    }
    if (u.suspended) throw new Error('This account is suspended.');
    write(K.session, u.id);
    window.dispatchEvent(new Event(AUTH_EVENT));
    return toSessionUser(u);
  },

  async signUp(email, password, usernameRaw) {
    seedOnce();
    const username = normalizeUsername(usernameRaw);
    const err = usernameError(username);
    if (err) throw new Error(err);
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    const list = users();
    if (list.some((x) => x.email.toLowerCase() === email.trim().toLowerCase()))
      throw new Error('An account with this email already exists.');
    const banned = read<string[]>(K.banned, []);
    if (RESERVED_USERNAMES.includes(username) || banned.includes(username))
      throw new Error('That username is not available.');
    if (list.some((x) => x.username === username))
      throw new Error('That username is already taken.');

    const user: DemoUser = {
      id: uid(),
      email: email.trim().toLowerCase(),
      passHash: await sha256(password),
      username,
      displayName: username,
      suspended: false,
      createdAt: new Date().toISOString(),
    };
    write(K.users, [...list, user]);
    const profile = defaultProfile(user.id, username, username);
    const all = profiles();
    all.push(profile);
    saveProfiles(all);
    write(K.session, user.id);
    window.dispatchEvent(new Event(AUTH_EVENT));
    return { needsVerification: false, user: toSessionUser(user) };
  },

  async signOut() {
    localStorage.removeItem(K.session);
    window.dispatchEvent(new Event(AUTH_EVENT));
  },

  async sendPasswordReset(email) {
    // DEMO ONLY: no email delivery in demo mode.
    const exists = users().some((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!exists) throw new Error('No account found with that email.');
  },

  async updatePassword(newPassword) {
    const session = requireUser();
    if (newPassword.length < 8) throw new Error('Password must be at least 8 characters.');
    const list = users();
    const idx = list.findIndex((x) => x.id === session.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], passHash: await sha256(newPassword) };
      write(K.users, list);
    }
  },

  onAuthChange(cb) {
    const handler = () => cb(currentUser());
    window.addEventListener(AUTH_EVENT, handler);
    return () => window.removeEventListener(AUTH_EVENT, handler);
  },
};

const demoProfiles: Backend['profiles'] = {
  async getByUsername(usernameRaw) {
    seedOnce();
    const username = normalizeUsername(usernameRaw);
    const viewer = currentUser();
    const p = profiles().find((x) => x.username === username);
    if (!p || !visibleToViewer(p, viewer)) return null;
    return structuredClone(p);
  },

  async getOwn() {
    const session = currentUser();
    if (!session) return null;
    const p = profiles().find((x) => x.userId === session.id);
    return p ? structuredClone(p) : null;
  },

  async ensureOwn(username) {
    const session = requireUser();
    const all = profiles();
    const existing = all.find((x) => x.userId === session.id);
    if (existing) return structuredClone(existing);
    const p = defaultProfile(session.id, username, session.displayName || username);
    all.push(p);
    saveProfiles(all);
    return structuredClone(p);
  },

  async saveOwn(p) {
    const session = requireUser();
    const all = profiles();
    const idx = all.findIndex((x) => x.userId === session.id);
    if (idx < 0) throw new Error('Profile not found.');
    // userId is always re-stamped from the session — never trusted from input.
    const owned: Profile = { ...mergeDeep(all[idx], p), id: all[idx].id, userId: session.id, username: all[idx].username, updatedAt: new Date().toISOString() };
    all[idx] = owned;
    saveProfiles(all);
  },

  async isUsernameAvailable(username) {
    const u = normalizeUsername(username);
    if (RESERVED_USERNAMES.includes(u)) return false;
    if (read<string[]>(K.banned, []).includes(u)) return false;
    return !profiles().some((x) => x.username === u) && !users().some((x) => x.username === u);
  },

  async listExplore(q) {
    seedOnce();
    const banned = read<string[]>(K.banned, []);
    let list = profiles().filter(
      (p) => p.visibility === 'public' && !banned.includes(p.username) && !users().find((x) => x.id === p.userId)?.suspended
    );
    const search = q.search?.trim().toLowerCase();
    if (search) {
      list = list.filter(
        (p) => p.username.includes(search) || p.displayName.toLowerCase().includes(search)
      );
    }
    list = sortProfiles(list, q.sort);
    const start = (q.page - 1) * q.pageSize;
    const items = list.slice(start, start + q.pageSize).map(toSummary);
    return { items, page: q.page, hasMore: start + q.pageSize < list.length, total: list.length };
  },

  async deleteOwn() {
    const session = requireUser();
    saveProfiles(profiles().filter((x) => x.userId !== session.id));
    write(K.users, users().filter((x) => x.id !== session.id));
    localStorage.removeItem(K.session);
    window.dispatchEvent(new Event(AUTH_EVENT));
  },
};

const demoUploads: Backend['uploads'] = {
  // DEMO ONLY: files become data URLs (already size-capped by validateUpload).
  // Production uploads go to Supabase Storage under a per-user folder.
  async uploadImage(file) {
    return new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error('Could not read file.'));
      r.readAsDataURL(file);
    });
  },
  async uploadAudio(file) {
    return new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error('Could not read file.'));
      r.readAsDataURL(file);
    });
  },
};

const demoAnalytics: Backend['analytics'] = {
  async recordView(username) {
    // One view per username per browser session.
    const key = `kloa.viewed.${username}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    const store = read<Record<string, Record<string, number>>>(K.views, {});
    const today = dayKey(new Date());
    store[username] = { ...store[username], [today]: (store[username]?.[today] ?? 0) + 1 };
    write(K.views, store);
  },

  async recordClick(username, linkId) {
    const store = read<Record<string, Record<string, number>>>(K.clicks, {});
    store[username] = { ...store[username], [linkId]: (store[username]?.[linkId] ?? 0) + 1 };
    write(K.clicks, store);
  },

  async getSummary(username) {
    const p = profiles().find((x) => x.username === normalizeUsername(username));
    const base = seededAnalytics(username);
    const extra = recordedViews(username);
    const extraTotal = Object.values(extra).reduce((a, b) => a + b, 0);
    base.viewsTotal += extraTotal;
    base.viewsToday += extra[dayKey(new Date())] ?? 0;
        base.daily = base.daily.map((d) => ({ ...d, views: d.views + (extra[d.date] ?? 0) }));
    base.viewsMonth = base.daily.reduce((a, d) => a + d.views, 0);
    const clicks = read<Record<string, Record<string, number>>>(K.clicks, {})[username] ?? {};
    base.clicksTotal += Object.values(clicks).reduce((a, b) => a + b, 0);
    const rand = mulberry32(hashSeed(username + 'links'));
    base.topLinks = (p?.links ?? []).slice(0, 5).map((link) => ({
      title: link.title,
      clicks: (p ? 30 + Math.round(rand() * 400) : 0) + (clicks[link.id] ?? 0),
    }));
    base.topLinks.sort((a, b) => b.clicks - a.clicks);
    return base;
  },
};

const demoReports: Backend['reports'] = {
  async create(username, reason, details) {
    const reports = read<ReportItem[]>(K.reports, []);
    reports.unshift({
      id: uid(),
      username: normalizeUsername(username),
      reason,
      details: details.slice(0, 500),
      status: 'open',
      createdAt: new Date().toISOString(),
    });
    write(K.reports, reports);
  },
};

function requireAdmin(): SessionUser {
  const u = currentUser();
  if (!u || !u.isAdmin) throw new Error('Admin access required.');
  return u;
}

function userRow(u: DemoUser): AdminUserRow {
  const p = profiles().find((x) => x.userId === u.id);
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    displayName: u.displayName,
    suspended: u.suspended,
    badges: p?.badges ?? [],
    views: p ? demoViews(p.username) : 0,
    visibility: p?.visibility ?? 'public',
    createdAt: u.createdAt,
  };
}

const demoAdmin: Backend['admin'] = {
  async isAdmin() {
    return currentUser()?.isAdmin ?? false;
  },

  async listUsers(search, page) {
    requireAdmin();
    let list = users();
    const s = search.trim().toLowerCase();
    if (s) list = list.filter((x) => x.username.includes(s) || x.email.includes(s) || x.displayName.toLowerCase().includes(s));
    list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * 10;
    return {
      items: list.slice(start, start + 10).map(userRow),
      page,
      hasMore: start + 10 < list.length,
      total: list.length,
    };
  },

  async setSuspended(userId, suspended) {
    requireAdmin();
    const list = users();
    const idx = list.findIndex((x) => x.id === userId);
    if (idx < 0) throw new Error('User not found.');
    if (list[idx].email === DEMO_ADMIN_EMAIL) throw new Error('Cannot suspend the admin account.');
    list[idx] = { ...list[idx], suspended };
    write(K.users, list);
  },

  async deleteUser(userId) {
    requireAdmin();
    if (userId === 'demo-user-admin') throw new Error('Cannot delete the admin account.');
    write(K.users, users().filter((x) => x.id !== userId));
    saveProfiles(profiles().filter((x) => x.userId !== userId));
  },

  async banUsername(username) {
    requireAdmin();
    const u = normalizeUsername(username);
    const banned = read<string[]>(K.banned, []);
    if (!banned.includes(u)) write(K.banned, [...banned, u]);
  },

  async grantBadge(userId, badge) {
    requireAdmin();
    const all = profiles();
    const idx = all.findIndex((x) => x.userId === userId);
    if (idx < 0) throw new Error('Profile not found.');
    if (!all[idx].badges.includes(badge)) all[idx].badges.push(badge);
    saveProfiles(all);
  },

  async revokeBadge(userId, badge) {
    requireAdmin();
    const all = profiles();
    const idx = all.findIndex((x) => x.userId === userId);
    if (idx < 0) throw new Error('Profile not found.');
    all[idx].badges = all[idx].badges.filter((b) => b !== badge);
    saveProfiles(all);
  },

  async setFeatured(username, featured) {
    requireAdmin();
    const all = profiles();
    const idx = all.findIndex((x) => x.username === normalizeUsername(username));
    if (idx < 0) throw new Error('Profile not found.');
    all[idx].featured = featured;
    saveProfiles(all);
  },

  async listReports() {
    requireAdmin();
    return read<ReportItem[]>(K.reports, []);
  },

  async resolveReport(id, outcome) {
    requireAdmin();
    const reports = read<ReportItem[]>(K.reports, []);
    const idx = reports.findIndex((r) => r.id === id);
    if (idx >= 0) {
      reports[idx] = {
        ...reports[idx],
        status: 'resolved',
        details: outcome === 'actioned' ? reports[idx].details : reports[idx].details,
      };
      write(K.reports, reports);
    }
  },

  async getStats() {
    requireAdmin();
    const ps = profiles();
    return {
      totalUsers: users().length,
      totalProfiles: ps.length,
      totalViews: ps.reduce((a, p) => a + demoViews(p.username), 0),
      totalClicks: ps.reduce((a, p) => a + p.links.length * 137, 0),
      openReports: read<ReportItem[]>(K.reports, []).filter((r) => r.status === 'open').length,
    };
  },

  async listBanned() {
    requireAdmin();
    return read<string[]>(K.banned, []);
  },
};

/* ------------------------------------------------------------------ */
/* DEMO backend assembly — ⚠️ demo/local only, see file header.        */
/* ------------------------------------------------------------------ */
export const demoBackend: Backend = {
  mode: 'demo',
  auth: demoAuth,
  profiles: demoProfiles,
  uploads: demoUploads,
  analytics: demoAnalytics,
  reports: demoReports,
  admin: demoAdmin,
};
