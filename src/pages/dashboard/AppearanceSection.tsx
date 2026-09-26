import { useDashboard } from '@/components/dashboard/DashboardContext';
import { Card } from '@/components/ui/Surfaces';
import { Slider, Toggle } from '@/components/ui/Inputs';
import { ColorPicker, Tabs } from '@/components/ui/ColorPicker';
import type { BackgroundType, CardMode } from '@/types';

/** Dashboard → Appearance: background + profile card styling. */
export default function AppearanceSection() {
  const { profile, update } = useDashboard();
  if (!profile) return null;

  const bg = profile.background;
  const card = profile.card;
  const setBg = (patch: Partial<typeof bg>) => update({ background: { ...bg, ...patch } });
  const setCard = (patch: Partial<typeof card>) => update({ card: { ...card, ...patch } });

  const bgTabs: { id: BackgroundType; label: string }[] = [
    { id: 'solid', label: 'Solid' },
    { id: 'gradient', label: 'Gradient' },
    { id: 'animated-gradient', label: 'Animated' },
    { id: 'image', label: 'Image' },
    { id: 'video', label: 'Video' },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-white">Appearance</h1>
        <p className="mt-1 text-sm text-ink-dim">Background and profile card — the preview updates live.</p>
      </header>

      <Card className="space-y-5">
        <h2 className="font-display text-sm font-semibold text-white">Background</h2>
        <Tabs tabs={bgTabs} active={bg.type} onChange={(id) => setBg({ type: id as BackgroundType })} />

        {bg.type === 'solid' && (
          <ColorPicker label="Color" value={bg.color} onChange={(v) => setBg({ color: v })} />
        )}

        {(bg.type === 'gradient' || bg.type === 'animated-gradient') && (
          <div className="grid gap-5 sm:grid-cols-2">
            <ColorPicker label="From" value={bg.gradient.from} onChange={(v) => setBg({ gradient: { ...bg.gradient, from: v } })} />
            <ColorPicker label="To" value={bg.gradient.to} onChange={(v) => setBg({ gradient: { ...bg.gradient, to: v } })} />
            <Slider
              label="Angle"
              value={bg.gradient.angle}
              min={0}
              max={360}
              onChange={(v) => setBg({ gradient: { ...bg.gradient, angle: v } })}
              suffix="°"
            />
          </div>
        )}

        {bg.type === 'image' && (
          <div className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">Image URL</span>
              <input
                className="input-base"
                value={bg.imageUrl}
                onChange={(e) => setBg({ imageUrl: e.target.value })}
                placeholder="https://…"
                spellCheck={false}
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <Slider label="Blur" value={bg.blur} min={0} max={30} onChange={(v) => setBg({ blur: v })} suffix="px" />
              <Slider label="Brightness" value={bg.brightness} min={10} max={200} onChange={(v) => setBg({ brightness: v })} suffix="%" />
              <Slider label="Saturation" value={bg.saturation} min={0} max={200} onChange={(v) => setBg({ saturation: v })} suffix="%" />
              <Slider label="Contrast" value={bg.contrast} min={10} max={200} onChange={(v) => setBg({ contrast: v })} suffix="%" />
              <Slider label="Opacity" value={bg.opacity} min={5} max={100} onChange={(v) => setBg({ opacity: v })} suffix="%" />
              <Slider label="Scale" value={bg.scale} min={100} max={180} onChange={(v) => setBg({ scale: v })} suffix="%" />
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">Position</span>
                <select className="input-base" value={bg.position} onChange={(e) => setBg({ position: e.target.value })}>
                  {['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {bg.type === 'video' && (
          <div className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">Video URL (MP4/WebM)</span>
              <input
                className="input-base"
                value={bg.videoUrl}
                onChange={(e) => setBg({ videoUrl: e.target.value })}
                placeholder="https://…"
                spellCheck={false}
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <Slider label="Opacity" value={bg.videoOpacity} min={5} max={100} onChange={(v) => setBg({ videoOpacity: v })} suffix="%" />
              <Slider label="Blur" value={bg.videoBlur} min={0} max={30} onChange={(v) => setBg({ videoBlur: v })} suffix="px" />
              <Slider label="Speed" value={bg.videoSpeed} min={0.25} max={2} step={0.25} onChange={(v) => setBg({ videoSpeed: v })} suffix="×" />
              <div className="flex items-end gap-6 pb-1">
                <label className="flex items-center gap-2.5 text-sm text-ink-dim">
                  <Toggle checked={bg.videoLoop} onChange={(v) => setBg({ videoLoop: v })} label="Loop" /> Loop
                </label>
                <label className="flex items-center gap-2.5 text-sm text-ink-dim">
                  <Toggle checked={bg.videoMuted} onChange={(v) => setBg({ videoMuted: v })} label="Muted" /> Muted
                </label>
              </div>
            </div>
          </div>
        )}

        <Slider label="Dark overlay" value={bg.overlay} min={0} max={90} onChange={(v) => setBg({ overlay: v })} suffix="%" />
      </Card>

      <Card className="space-y-5">
        <h2 className="font-display text-sm font-semibold text-white">Profile card</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">Mode</span>
            <select
              className="input-base"
              value={card.mode}
              onChange={(e) => setCard({ mode: e.target.value as CardMode })}
            >
              <option value="card">Card</option>
              <option value="glass">Glass</option>
              <option value="minimal">Minimal</option>
              <option value="cardless">Cardless</option>
              <option value="fullscreen">Fullscreen</option>
            </select>
          </label>
          <Slider label="Width" value={card.width} min={340} max={640} onChange={(v) => setCard({ width: v })} suffix="px" />
          <Slider label="Opacity" value={card.opacity} min={0} max={100} onChange={(v) => setCard({ opacity: v })} suffix="%" />
          <Slider label="Backdrop blur" value={card.blur} min={0} max={40} onChange={(v) => setCard({ blur: v })} suffix="px" />
          <Slider label="Corner radius" value={card.radius} min={0} max={40} onChange={(v) => setCard({ radius: v })} suffix="px" />
          <Slider label="Padding" value={card.padding} min={12} max={64} onChange={(v) => setCard({ padding: v })} suffix="px" />
          <Slider label="Border width" value={card.borderWidth} min={0} max={6} onChange={(v) => setCard({ borderWidth: v })} suffix="px" />
          <Slider label="Shadow" value={card.shadow} min={0} max={100} onChange={(v) => setCard({ shadow: v })} />
          <ColorPicker label="Border color" value={card.borderColor} onChange={(v) => setCard({ borderColor: v })} />
          <ColorPicker label="Card background" value={card.background} onChange={(v) => setCard({ background: v })} />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-4 py-3">
          <Toggle
            checked={card.gradient !== null}
            onChange={(on) => setCard({ gradient: on ? { from: '#312e81', to: '#7C5CFF', angle: 135 } : null })}
            label="Card gradient"
          />
          <span className="text-sm text-ink-dim">Use a gradient card background</span>
        </div>
        {card.gradient && (
          <div className="grid gap-5 sm:grid-cols-3">
            <ColorPicker label="From" value={card.gradient.from} onChange={(v) => setCard({ gradient: { ...card.gradient!, from: v } })} />
            <ColorPicker label="To" value={card.gradient.to} onChange={(v) => setCard({ gradient: { ...card.gradient!, to: v } })} />
            <Slider label="Angle" value={card.gradient.angle} min={0} max={360} onChange={(v) => setCard({ gradient: { ...card.gradient!, angle: v } })} suffix="°" />
          </div>
        )}
      </Card>
    </div>
  );
}
