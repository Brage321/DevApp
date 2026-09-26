import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX, Music2 } from 'lucide-react';
import type { MusicConfig } from '@/types';
import { clamp, cn } from '@/lib/utils';
import { Slider } from '@/components/ui/Inputs';

/* ------------------------------------------------------------------ */
/* MusicPlayer — explicit user-initiated playback.                     */
/* Browsers block autoplay with sound; we never force it. The play     */
/* button is prominent and clearly labeled.                            */
/* ------------------------------------------------------------------ */

export function MusicPlayer({ music }: { music: MusicConfig }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(music.volume);
  const [error, setError] = useState(false);

  useEffect(() => {
    setVolume(music.volume);
  }, [music.volume]);

  const toggle = () => {
    if (!music.audioUrl) return;
    if (!audioRef.current) {
      const el = new Audio(music.audioUrl);
      el.loop = music.loop;
      el.volume = clamp(volume / 100, 0, 1);
      el.addEventListener('ended', () => setPlaying(false));
      el.addEventListener('error', () => {
        setError(true);
        setPlaying(false);
      });
      audioRef.current = el;
    }
    const el = audioRef.current;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().then(() => setPlaying(true)).catch(() => setError(true));
    }
  };

  useEffect(
    () => () => {
      audioRef.current?.pause();
      audioRef.current = null;
    },
    []
  );

  const changeVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = clamp(v / 100, 0, 1);
    if (v === 0) setMuted(true);
    else setMuted(false);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border px-4 py-3',
        error ? 'border-red-500/30 bg-red-500/[0.06]' : 'border-white/10 bg-white/[0.05]'
      )}
    >
      <button
        onClick={toggle}
        disabled={!music.audioUrl || error}
        aria-label={playing ? 'Pause music' : 'Play music'}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black transition-transform duration-200 hover:scale-105 disabled:opacity-40',
          playing && 'animate-pulse-soft'
        )}
        style={{ background: 'linear-gradient(135deg, #fff, #d9d9e3)' }}
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-white">
          {music.title || 'Untitled track'}
        </p>
        <p className="truncate text-xs text-white/60">
          {error ? 'Track unavailable' : music.artist || 'Unknown artist'}
        </p>
      </div>

      <div className="flex w-24 shrink-0 items-center gap-1.5">
        <button
          onClick={() => {
            setMuted((m) => !m);
            if (audioRef.current) audioRef.current.muted = !muted;
          }}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="text-white/60 transition-colors hover:text-white"
        >
          {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <div className="w-full [&_input]:h-1 [&_input]:bg-white/15">
          <Slider
            value={muted ? 0 : volume}
            min={0}
            max={100}
            onChange={changeVolume}
            label="Volume"
          />
        </div>
      </div>

      <Music2 size={14} className="shrink-0 text-white/30" aria-hidden />
    </div>
  );
}
