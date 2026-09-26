import { memo, useEffect, useRef } from 'react';
import type { EffectType } from '@/types';
import { cn, isLowPowerDevice, prefersReducedMotion } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* EffectsRenderer — canvas star/snow/particle fields + CSS overlays   */
/* (grain, vignette, scanlines) + pointer lights.                      */
/*                                                                     */
/* Performance rules:                                                  */
/* - one shared canvas, DPR capped at 1.5                              */
/* - particle count scales with area & intensity, hard-capped          */
/* - rAF paused when the tab is hidden; skipped for reduced motion     */
/*   and low-power devices                                             */
/* ------------------------------------------------------------------ */

interface Props {
  effects: EffectType[];
  intensity: number; // 0-100
  accent: string;
  className?: string;
}

export const EffectsRenderer = memo(function EffectsRenderer({ effects, intensity, accent, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  const has = (e: EffectType) => effects.includes(e);
  const wantsCanvas = has('stars') || has('snow') || has('particles');
  const wantsLights = has('cursorGlow') || has('mouseLight');
  const allowMotion = !prefersReducedMotion() && !isLowPowerDevice();

  useEffect(() => {
    if (!wantsCanvas || !allowMotion) return;
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;

    interface P {
      x: number; y: number; vx: number; vy: number;
      r: number; phase: number; speed: number;
    }
    let particles: P[] = [];

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const t = intensity / 100;
      const area = width * height;
      let count = 0;
      if (has('stars')) count = Math.min(160, Math.round((area / 16000) * (0.5 + t)));
      if (has('snow')) count = Math.max(count, Math.min(120, Math.round((area / 22000) * (0.5 + t))));
      if (has('particles')) count = Math.max(count, Math.min(70, Math.round((area / 30000) * (0.5 + t))));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: has('snow') ? 0.25 + Math.random() * 0.55 : (Math.random() - 0.5) * 0.12,
        r: has('snow') ? 0.8 + Math.random() * 2.1 : 0.5 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
      }));
    };

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      const t = intensity / 100;

      for (const p of particles) {
        p.phase += 0.012 * p.speed;
        if (has('snow')) {
          p.x += Math.sin(p.phase) * 0.35;
          p.y += p.vy;
          if (p.y > height + 4) {
            p.y = -4;
            p.x = Math.random() * width;
          }
        } else {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -4) p.x = width + 4;
          if (p.x > width + 4) p.x = -4;
          if (p.y < -4) p.y = height + 4;
          if (p.y > height + 4) p.y = -4;
        }

        const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(p.phase * 2.2));
        ctx.globalAlpha = (has('snow') ? 0.5 : 0.28 + 0.6 * twinkle) * (0.35 + 0.65 * t);
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (has('particles')) {
        const maxDist = 90;
        ctx.globalAlpha = 0.14 * t;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 0.6;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d2 = dx * dx + dy * dy;
            if (d2 < maxDist * maxDist) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(tick);
      else cancelAnimationFrame(raf);
    };

    resize();
    raf = requestAnimationFrame(tick);
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantsCanvas, allowMotion, intensity, accent, effects.join(',')]);

  useEffect(() => {
    if (!wantsLights || !allowMotion) return;
    let raf = 0;
    let mx = -999;
    let my = -999;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          const el = has('cursorGlow') ? glowRef.current : null;
          const light = has('mouseLight') ? lightRef.current : null;
          if (el) el.style.transform = `translate(${mx - 175}px, ${my - 175}px)`;
          if (light) light.style.transform = `translate(${mx - 400}px, ${my - 400}px)`;
        });
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantsLights, allowMotion, effects.join(',')]);

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      {wantsCanvas && allowMotion && <canvas ref={canvasRef} className="absolute inset-0" />}

      {has('grain') && <div className="noise absolute inset-0 opacity-[0.16]" />}

      {has('vignette') && (
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.55) 100%)' }}
        />
      )}

      {has('scanlines') && (
        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 1px, transparent 1px, transparent 3px)',
          }}
        />
      )}

      {has('cursorGlow') && allowMotion && (
        <div
          ref={glowRef}
          className="absolute left-0 top-0 h-[350px] w-[350px] rounded-full opacity-40 mix-blend-screen"
          style={{ background: `radial-gradient(circle, ${accent}55 0%, transparent 60%)` }}
        />
      )}

      {has('mouseLight') && allowMotion && (
        <div
          ref={lightRef}
          className="absolute left-0 top-0 h-[800px] w-[800px] rounded-full opacity-25 mix-blend-screen"
          style={{ background: `radial-gradient(circle, ${accent}44 0%, transparent 55%)` }}
        />
      )}
    </div>
  );
});
