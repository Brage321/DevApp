import {
  Github,
  Globe,
  Instagram,
  Twitch,
  Youtube,
} from 'lucide-react';
import {
  DiscordIcon,
  RedditIcon,
  SpotifyIcon,
  SteamIcon,
  TelegramIcon,
  TikTokIcon,
  XIcon,
} from '@/components/icons/BrandIcons';
import { SOCIAL_PLATFORMS } from '@/lib/config';
import type { SocialPlatform } from '@/types';

/* ------------------------------------------------------------------ */
/* Platform → icon mapping (brand-accurate SVGs where Lucide lacks).   */
/* ------------------------------------------------------------------ */

const ICONS: Record<SocialPlatform, React.ComponentType<{ size?: number | string; className?: string }>> = {
  discord: DiscordIcon,
  github: Github,
  youtube: Youtube,
  twitch: Twitch,
  x: XIcon,
  instagram: Instagram,
  tiktok: TikTokIcon,
  spotify: SpotifyIcon,
  steam: SteamIcon,
  reddit: RedditIcon,
  telegram: TelegramIcon,
  website: Globe,
};

export function SocialIcon({
  platform,
  size = 20,
  className,
}: {
  platform: SocialPlatform;
  size?: number;
  className?: string;
}) {
  const Icon = ICONS[platform] ?? Globe;
  return <Icon size={size} className={className} />;
}

export { SOCIAL_PLATFORMS };
