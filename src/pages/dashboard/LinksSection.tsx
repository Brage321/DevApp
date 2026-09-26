import { useState } from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { useDashboard } from '@/components/dashboard/DashboardContext';
import { useDragOrder } from '@/hooks/useDragOrder';
import { Card } from '@/components/ui/Surfaces';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Inputs';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { SOCIAL_PLATFORMS, SOCIAL_ORDER, FILE_LIMITS } from '@/lib/config';
import { safeSocialUrl, safeUrl } from '@/lib/security';
import type { CustomLink, SocialPlatform } from '@/types';
import { cn, uid } from '@/lib/utils';
import { ListControls } from './ListControls';

export default function LinksSection() {
  const { profile } = useDashboard();
  if (!profile) return null;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-white">Links</h1>
        <p className="mt-1 text-sm text-ink-dim">
          Social profiles and custom link cards. Drag to reorder — changes save with your profile.
        </p>
      </header>
      <SocialsEditor />
      <CustomLinksEditor />
    </div>
  );
}

function SocialsEditor() {
  const { profile, update } = useDashboard();
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('discord');
  const socials = [...profile!.socials].sort((a, b) => a.order - b.order);
  const { draggingId, dragProps, move } = useDragOrder(socials, (next) =>
    update({ socials: next.map((s, i) => ({ ...s, order: i })) })
  );
  const alreadyAdded = profile!.socials.some((s) => s.platform === newPlatform);
  const atLimit = profile!.socials.length >= FILE_LIMITS.socialsMax;

  const patch = (id: string, p: Partial<(typeof socials)[number]>) =>
    update({ socials: profile!.socials.map((s) => (s.id === id ? { ...s, ...p } : s)) });

  return (
    <Card className="space-y-4">
      <h2 className="font-display text-sm font-semibold text-white">Social links</h2>

      <div className="flex flex-wrap items-end gap-2.5">
        <label className="min-w-40 flex-1">
          <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">Platform</span>
          <select
            className="input-base"
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
          >
            {SOCIAL_ORDER.map((p) => (
              <option key={p} value={p}>{SOCIAL_PLATFORMS[p].label}</option>
            ))}
          </select>
        </label>
        <Button
          variant="secondary"
          icon={<Plus size={15} />}
          disabled={alreadyAdded || atLimit}
          onClick={() =>
            update({
              socials: [
                ...profile!.socials,
                { id: uid(), platform: newPlatform, url: '', label: '', hidden: false, order: profile!.socials.length },
              ],
            })
          }
        >
          {alreadyAdded ? 'Already added' : 'Add'}
        </Button>
      </div>

      {atLimit && (
        <p className="text-xs text-amber-400">Limit of {FILE_LIMITS.socialsMax} social links reached.</p>
      )}

      {socials.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-faint">
          No social links yet — add your first above.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {socials.map((s, idx) => {
            const m = SOCIAL_PLATFORMS[s.platform];
            const invalid = s.url !== '' && !safeSocialUrl(s.url, m.prefix);
            return (
              <li
                key={s.id}
                className={cn(
                  'flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-white/[0.02] p-3',
                  draggingId === s.id && 'opacity-50'
                )}
                {...dragProps(s.id)}
              >
                <GripVertical size={16} className="cursor-grab text-ink-faint" aria-hidden />
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ color: m.color, background: `${m.color}1a` }}
                >
                  <SocialIcon platform={s.platform} size={15} />
                </span>
                <div className="min-w-40 flex-1">
                  <Input
                    value={s.url}
                    onChange={(e) => patch(s.id, { url: e.target.value })}
                    placeholder={m.placeholder}
                    aria-label={`${m.label} handle or URL`}
                    aria-invalid={invalid}
                    className={invalid ? 'border-red-500/50' : undefined}
                  />
                  {invalid && (
                    <p className="mt-1 text-[11px] text-red-400">Enter a valid handle or https:// URL</p>
                  )}
                </div>
                <div className="w-32">
                  <Input
                    value={s.label}
                    onChange={(e) => patch(s.id, { label: e.target.value.slice(0, 24) })}
                    placeholder="Label (optional)"
                    aria-label="Custom label"
                  />
                </div>
                <ListControls
                  onUp={() => move(s.id, -1)}
                  onDown={() => move(s.id, 1)}
                  disableUp={idx === 0}
                  disableDown={idx === socials.length - 1}
                  hidden={s.hidden}
                  onToggleHidden={() => patch(s.id, { hidden: !s.hidden })}
                  onRemove={() => update({ socials: profile!.socials.filter((x) => x.id !== s.id) })}
                />
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-[11px] text-ink-faint">
        Handles are prefixed automatically (e.g. x.com/yourname). Discord usernames are copied on
        your profile.
      </p>
    </Card>
  );
}

/* -------------------------- custom links -------------------------- */

function CustomLinksEditor() {
  const { profile, update } = useDashboard();
  const links = [...profile!.links].sort((a, b) => a.order - b.order);
  const { draggingId, dragProps, move } = useDragOrder(links, (next) =>
    update({ links: next.map((l, i) => ({ ...l, order: i })) })
  );
  const atLimit = links.length >= FILE_LIMITS.linksMax;

  const patch = (id: string, p: Partial<CustomLink>) =>
    update({ links: profile!.links.map((l) => (l.id === id ? { ...l, ...p } : l)) });

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-white">Custom links</h2>
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus size={15} />}
          disabled={atLimit}
          onClick={() =>
            update({
              links: [
                ...profile!.links,
                {
                  id: uid(), title: 'New link', description: '', url: 'https://',
                  imageUrl: '', color: '#8B5CF6', gradient: null, hover: 'lift',
                  hidden: false, order: profile!.links.length,
                },
              ],
            })
          }
        >
          Add link
        </Button>
      </div>

      {links.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-faint">
          No custom links yet. Create beautiful button cards for anything.
        </p>
      ) : (
        <ul className="space-y-4">
          {links.map((l, idx) => {
            const invalid = l.url !== '' && !safeUrl(l.url);
            return (
              <li
                key={l.id}
                className={cn(
                  'rounded-xl border border-line bg-white/[0.02] p-4',
                  draggingId === l.id && 'opacity-50'
                )}
                {...dragProps(l.id)}
              >
                <div className="flex items-center gap-2.5">
                  <GripVertical size={16} className="cursor-grab text-ink-faint" aria-hidden />
                  <span
                    className="h-6 w-6 shrink-0 rounded-md"
                    style={{ background: l.gradient ? `linear-gradient(120deg,${l.gradient.from},${l.gradient.to})` : l.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{l.title || 'Untitled'}</span>
                  <ListControls
                    onUp={() => move(l.id, -1)}
                    onDown={() => move(l.id, 1)}
                    disableUp={idx === 0}
                    disableDown={idx === links.length - 1}
                    hidden={l.hidden}
                    onToggleHidden={() => patch(l.id, { hidden: !l.hidden })}
                    onRemove={() => update({ links: profile!.links.filter((x) => x.id !== l.id) })}
                  />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Input
                    value={l.title}
                    onChange={(e) => patch(l.id, { title: e.target.value.slice(0, 64) })}
                    placeholder="Title"
                    aria-label="Link title"
                  />
                  <Input
                    value={l.url}
                    onChange={(e) => patch(l.id, { url: e.target.value })}
                    placeholder="https://…"
                    spellCheck={false}
                    aria-label="Link URL"
                    aria-invalid={invalid}
                    className={invalid ? 'border-red-500/50' : undefined}
                  />
                  <Input
                    value={l.description}
                    onChange={(e) => patch(l.id, { description: e.target.value.slice(0, 120) })}
                    placeholder="Description (optional)"
                    aria-label="Link description"
                    className="sm:col-span-2"
                  />
                  <ColorPicker label="Color" value={l.color} onChange={(v) => patch(l.id, { color: v })} />
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">Hover effect</span>
                    <select
                      className="input-base"
                      value={l.hover}
                      onChange={(e) => patch(l.id, { hover: e.target.value as CustomLink['hover'] })}
                    >
                      <option value="lift">Lift</option>
                      <option value="glow">Glow</option>
                      <option value="shine">Shine</option>
                      <option value="none">None</option>
                    </select>
                  </label>
                </div>
                {invalid && (
                  <p className="mt-2 text-[11px] text-red-400">
                    Only http(s) links are allowed — javascript: and data: URLs are rejected.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
