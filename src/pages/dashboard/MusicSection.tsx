import { useDashboard } from '@/components/dashboard/DashboardContext';
import { UploadField } from '@/components/dashboard/UploadField';
import { Card } from '@/components/ui/Surfaces';
import { Field, Input, Slider, Toggle } from '@/components/ui/Inputs';
import { MusicPlayer } from '@/components/profile/MusicPlayer';

/** Dashboard → Music: track metadata, audio upload, playback prefs. */
export default function MusicSection() {
  const { profile, update } = useDashboard();
  if (!profile) return null;
  const music = profile.music;
  const set = (patch: Partial<typeof music>) => update({ music: { ...music, ...patch } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-white">Music</h1>
        <p className="mt-1 text-sm text-ink-dim">Give your page a soundtrack with a built-in player.</p>
      </header>

      <Card className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-white">Enable profile music</h2>
          <Toggle checked={music.enabled} onChange={(v) => set({ enabled: v })} label="Enable music" />
        </div>

        {music.enabled && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Track title" htmlFor="mt">
                <Input id="mt" value={music.title} maxLength={64} onChange={(e) => set({ title: e.target.value })} placeholder="Midnight Drive" />
              </Field>
              <Field label="Artist" htmlFor="ma">
                <Input id="ma" value={music.artist} maxLength={48} onChange={(e) => set({ artist: e.target.value })} placeholder="You" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <UploadField
                kind="cover"
                label="Cover image"
                currentUrl={music.coverUrl}
                onUploaded={(url) => set({ coverUrl: url })}
              />
              <UploadField
                kind="audio"
                label="Audio file"
                currentUrl={music.audioUrl}
                onUploaded={(url) => set({ audioUrl: url })}
                aspect="wide"
              />
            </div>

            {!music.audioUrl && (
              <Field label="…or audio URL" htmlFor="mau" hint="Direct link to an MP3/OGG/WAV file.">
                <Input id="mau" value={music.audioUrl} onChange={(e) => set({ audioUrl: e.target.value })} placeholder="https://…/track.mp3" spellCheck={false} />
              </Field>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Slider label="Volume" value={music.volume} min={0} max={100} onChange={(v) => set({ volume: v })} suffix="%" />
              <div className="flex flex-col justify-end gap-3 pb-1">
                <label className="flex items-center gap-2.5 text-sm text-ink-dim">
                  <Toggle checked={music.loop} onChange={(v) => set({ loop: v })} label="Loop" /> Loop track
                </label>
                <label className="flex items-center gap-2.5 text-sm text-ink-dim">
                  <Toggle checked={music.autoplay} onChange={(v) => set({ autoplay: v })} label="Autoplay" /> Autoplay preference
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-xs leading-relaxed text-amber-300/90">
              Note: browsers block autoplay with sound — visitors will always see a clear play button
              first. The autoplay preference only relaxes this on supporting browsers.
            </div>

            <div>
              <h3 className="mb-3 text-[13px] font-medium text-ink-dim">Test player</h3>
              <MusicPlayer music={music} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
