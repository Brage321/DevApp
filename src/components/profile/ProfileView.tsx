import { memo, useMemo, useState } from 'react';
import { Eye, Flag, Link2 } from 'lucide-react';
import type { CardConfig, CustomLink, Profile, SocialLink } from '@/types';
import { BackgroundRenderer } from '@/components/profile/BackgroundRenderer';
import { EffectsRenderer } from '@/components/profile/EffectsRenderer';
import { MusicPlayer } from '@/components/profile/MusicPlayer';
import { BadgeRow } from '@/components/ui/Badge';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { SOCIAL_PLATFORMS } from '@/lib/config';
import { safeSocialUrl, safeUrl } from '@/lib/security';
import { cn, copyText, formatNumber, hexToRgba } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* ProfileView — the public profile renderer. Also used (scaled) in    */
/* the dashboard live preview and the landing hero preview.            */
/* ------------------------------------------------------------------ */

interface Props {
  profile: Profile;
  onLinkClick?: (link: CustomLink) => void;
  onReport?: () => void;
  className?: string;
}

function cardLayerStyle(card: CardConfig): React.CSSProperties {
  const minimal = card.mode === 'minimal' || card.mode === 'cardless';
  return {
    borderRadius: card.radius,
    borderColor: card.borderColor,
    borderWidth: minimal ? 0 : card.borderWidth,
    borderStyle: 'solid',
    boxShadow:
      minimal || card.shadow === 0
        ? undefined
        : `0 ${Math.round(card.shadow * 0.5)}px ${card.shadow * 1.6}px rgba(0,0,0,0.5)`,
  };
}

/** Background alpha layer for card/glass modes (keeps text opaque). */
function cardBgLayer(card: CardConfig): React.CSSProperties | null {
  if (card.mode === 'minimal' || card.mode === 'cardless') return null;
  if (card.gradient) {
    return {
      background: `linear-gradient(${card.gradient.angle}deg, ${card.gradient.from}, ${card.gradient.to})`,
      opacity: card.opacity / 100,
    };
  }
  return {
    background: card.background.startsWith('#')
      ? hexToRgba(card.background, card.opacity / 100)
      : card.background,
  };
}

function avatarStyle(p: Profile): React.CSSProperties {
  const a = p.avatar;
  const glow = a.glow > 0 ? `0 0 ${a.glow * 0.6}px ${hexToRgba(p.theme.accent, a.glow / 140)}` : undefined;
  const shadow = a.shadow > 0 ? `0 ${a.shadow * 0.25}px ${a.shadow * 0.8}px rgba(0,0,0,0.5)` : undefined;
  return {
    width: a.size,
    height: a.size,
    borderRadius: a.shape === 'circle' ? '9999px' : a.radius,
    border: a.borderWidth > 0 ? `${a.borderWidth}px solid ${a.borderColor}` : undefined,
    boxShadow: [glow, shadow].filter(Boolean).join(', ') || undefined,
  };
}

export const ProfileView = memo(function ProfileView({ profile, onLinkClick, onReport, className }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const socials = useMemo(
    () => profile.socials.filter((s) => !s.hidden).sort((a, b) => a.order - b.order),
    [profile.socials]
  );
  const links = useMemo(
    () => profile.links.filter((l) => !l.hidden).sort((a, b) => a.order - b.order),
    [profile.links]
  );

  const layer = cardBgLayer(profile.card);
  const fullscreen = profile.card.mode === 'fullscreen';
  const bare = fullscreen || profile.card.mode === 'cardless' || profile.card.mode === 'minimal';

  const handleSocial = async (s: SocialLink) => {
    const url = safeSocialUrl(s.url, SOCIAL_PLATFORMS[s.platform].prefix);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    // Platforms without a URL (e.g. Discord handles) copy to clipboard.
    if (s.url) {
      await copyText(s.url);
      setCopied(s.id);
      window.setTimeout(() => setCopied(null), 1400);
    }
  };

  return (
    <div className={cn('relative min-h-full w-full overflow-hidden', className)}>
      <BackgroundRenderer bg={profile.background} theme={profile.theme} />
      <EffectsRenderer
        effects={profile.effects.enabled}
        intensity={profile.effects.intensity}
        accent={profile.theme.accent}
      />

      <div
        className={cn(
          'relative z-10 flex min-h-full w-full items-center justify-center',
          fullscreen ? 'p-0' : 'p-4 sm:p-6'
        )}
        style={{ color: profile.theme.text }}
      >
        <div
          className={cn(
            'relative w-full',
            fullscreen
              ? 'flex min-h-screen items-center justify-center'
              : profile.card.mode === 'cardless'
                ? 'max-w-lg'
                : 'max-w-full'
          )}
          style={
            bare
              ? cardLayerStyle(profile.card)
              : { ...cardLayerStyle(profile.card), width: Math.min(profile.card.width, 640) }
          }
        >
          {/* card background + glass layers */}
          {layer && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{ ...layer, borderRadius: profile.card.radius }}
            />
          )}
          {profile.card.mode === 'glass' && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{ backdropFilter: `blur(${profile.card.blur}px)`, borderRadius: profile.card.radius }}
            />
          )}

          <div
            className={cn('relative flex flex-col items-center gap-4', fullscreen && 'w-full max-w-xl px-6')}
            style={{ padding: fullscreen ? 0 : profile.card.padding }}
          >
            {/* avatar — image with gradient-initials fallback */}
            <div className="relative" style={{ width: profile.avatar.size, height: profile.avatar.size }}>
              {profile.avatar.url ? (
                <img
                  src={profile.avatar.url}
                  alt=""
                  aria-hidden
                  style={avatarStyle(profile)}
                  className="h-full w-full select-none object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className="flex select-none items-center justify-center font-display font-semibold text-white"
                  style={{
                    ...avatarStyle(profile),
                    background: `radial-gradient(120% 120% at 20% 15%, ${hexToRgba(profile.theme.accent, 0.9)}, #14121f 75%)`,
                  }}
                >
                  <span style={{ fontSize: profile.avatar.size * 0.38 }}>
                    {(profile.displayName || profile.username).slice(0, 1).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* identity */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <h1 className="font-display text-2xl font-bold leading-tight">
                  {profile.displayName || profile.username}
                </h1>
                <BadgeRow badges={profile.badges} />
              </div>
              <p className="mt-0.5 text-sm opacity-60">@{profile.username}</p>
            </div>

            {profile.bio && (
              <p className="max-w-full whitespace-pre-line break-words text-center text-[15px] leading-relaxed opacity-85">
                {profile.bio}
              </p>
            )}

            {/* socials */}
            {socials.length > 0 && (
              <ul className="flex flex-wrap items-center justify-center gap-2.5">
                {socials.map((s) => (
                  <li key={s.id} className="relative">
                    <button
                      onClick={() => void handleSocial(s)}
                      aria-label={`${SOCIAL_PLATFORMS[s.platform].label}${copied === s.id ? ' — copied' : ''}`}
                      title={s.label || SOCIAL_PLATFORMS[s.platform].label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-current opacity-90 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.12] hover:opacity-100"
                    >
                      <SocialIcon platform={s.platform} size={17} />
                    </button>
                    {copied === s.id && (
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-0.5 text-[11px] text-white">
                        copied
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* custom links */}
            {links.length > 0 && (
              <ul className="flex w-full flex-col gap-2.5">
                {links.map((l) => {
                  const url = safeUrl(l.url);
                  if (!url) return null;
                  const hoverCls =
                    l.hover === 'lift'
                      ? 'hover:-translate-y-0.5 hover:shadow-lg'
                      : l.hover === 'glow'
                        ? 'hover:brightness-110'
                        : 'hover:opacity-95';
                  return (
                    <li key={l.id}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        onClick={() => onLinkClick?.(l)}
                        className={cn(
                          'group flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/10 px-4 py-3 transition-all duration-200 ease-out-expo',
                          hoverCls
                        )}
                        style={{
                          background: l.gradient
                            ? `linear-gradient(120deg, ${l.gradient.from}, ${l.gradient.to})`
                            : hexToRgba(l.color, 0.14),
                        }}
                      >
                        {l.imageUrl ? (
                          <img
                            src={l.imageUrl}
                            alt=""
                            loading="lazy"
                            className="h-10 w-10 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{ background: hexToRgba(l.color, 0.25) }}
                          >
                            <Link2 size={16} />
                          </span>
                        )}
                        <span className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-sm font-semibold">{l.title}</span>
                          {l.description && (
                            <span className="block truncate text-xs opacity-70">{l.description}</span>
                          )}
                        </span>
                        <span
                          className="shrink-0 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-70"
                          aria-hidden
                        >
                          →
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* music */}
            {profile.music.enabled && profile.music.audioUrl && (
              <div className="w-full">
                <MusicPlayer music={profile.music} />
              </div>
            )}

            {/* footer: views + report / brand */}
            {(onReport || profile.views > 0) && (
              <div className="mt-1 flex w-full items-center justify-between text-[11px] opacity-55">
                <span className="inline-flex items-center gap-1.5">
                  <Eye size={12} />
                  {formatNumber(profile.views)} views
                </span>
                {onReport ? (
                  <button
                    onClick={onReport}
                    className="inline-flex items-center gap-1 transition-opacity hover:opacity-100"
                    aria-label="Report this profile"
                  >
                    <Flag size={11} />
                    report
                  </button>
                ) : (
                  <span className="font-display tracking-wide">kloa.lol</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
