import { memo } from 'react';
import type { BackgroundConfig, ThemeConfig } from '@/types';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* BackgroundRenderer — solid / gradient / animated / image / video    */
/* with fine-tuning controls + dark overlay for text readability.      */
/* ------------------------------------------------------------------ */

interface Props {
  bg: BackgroundConfig;
  theme: ThemeConfig;
  animated?: boolean; // false in static previews
  className?: string;
}

export const BackgroundRenderer = memo(function BackgroundRenderer({ bg, theme, animated = true, className }: Props) {
  const isMedia = bg.type === 'image' || bg.type === 'video';
  const overlay = bg.overlay / 100;

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)} aria-hidden>
      {/* Base layer — always present so media fades over a theme color */}
      <div className="absolute inset-0" style={{ background: theme.background }} />

      {bg.type === 'solid' && <div className="absolute inset-0" style={{ background: bg.color }} />}

      {(bg.type === 'gradient' || bg.type === 'animated-gradient') && (
        <div
          className={cn('absolute inset-0', animated && bg.type === 'animated-gradient' && 'animate-aurora')}
          style={{
            background: `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})`,
            backgroundSize: bg.type === 'animated-gradient' ? '220% 220%' : undefined,
          }}
        />
      )}

      {bg.type === 'image' && bg.imageUrl && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("${bg.imageUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: bg.position,
            filter: `blur(${bg.blur}px) brightness(${bg.brightness}%) saturate(${bg.saturation}%) contrast(${bg.contrast}%)`,
            opacity: bg.opacity / 100,
            transform: `scale(${Math.max(1.01, bg.scale / 100)})`,
          }}
        />
      )}

      {bg.type === 'video' && bg.videoUrl && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={bg.videoUrl}
          autoPlay={animated}
          muted={bg.videoMuted}
          loop={bg.videoLoop}
          playsInline
          style={{
            opacity: bg.videoOpacity / 100,
            filter: bg.videoBlur > 0 ? `blur(${bg.videoBlur}px)` : undefined,
            transform: `scale(${Math.max(1.01, bg.scale / 100)})`,
          }}
        />
      )}

      {/* Readability overlay */}
      {overlay > 0 && (
        <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
      )}
      {isMedia && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
      )}
    </div>
  );
});
