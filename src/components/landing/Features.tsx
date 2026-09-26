import {
  BarChart3,
  Blocks,
  Gauge,
  Image as ImageIcon,
  Link2,
  MessageCircle,
  Music,
  Palette,
  BadgeCheck,
  MonitorSmartphone,
  Wand2,
  Globe,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/Surfaces';

const FEATURES = [
  { icon: Palette, title: 'Make it feel like you', desc: 'Change the colors, spacing, and mood until the page actually feels like yours.' },
  { icon: ImageIcon, title: 'Backgrounds that match the vibe', desc: 'Use a photo, gradient, solid color, or a little motion without making it feel busy.' },
  { icon: Music, title: 'Add a soundtrack', desc: 'Drop in music so your page has a little more personality and atmosphere.' },
  { icon: Link2, title: 'All your links in one place', desc: 'GitHub, Spotify, YouTube, Discord, and everything else you want people to find.' },
  { icon: Blocks, title: 'Themes that are actually usable', desc: 'Start with a clean preset and tweak it until it lands just right.' },
  { icon: Wand2, title: 'Buttons with a bit of flair', desc: 'Use custom cards, colors, and details to make the important stuff easy to notice.' },
  { icon: BarChart3, title: 'See what people actually click', desc: 'A simple look at views, clicks, and where interest is coming from.' },
  { icon: MessageCircle, title: 'Discord integration', desc: 'Bring your community presence into the same place as the rest of your online identity.' },
  { icon: Gauge, title: 'Subtle effects', desc: 'A little glow, grain, or motion can make a page feel alive without being overdone.' },
  { icon: MonitorSmartphone, title: 'Feels right on phones too', desc: 'The layout stays readable and clean from your pocket to your desk.' },
  { icon: Globe, title: 'Room for a custom domain later', desc: 'The groundwork is there for a cleaner branded URL when the time comes.' },
  { icon: BadgeCheck, title: 'Badges that feel earned', desc: 'Show a little status without turning the page into a badge farm.' },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-24 py-24" aria-label="Features">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          center
          title="Everything your identity needs"
          subtitle="A complete toolkit for building a page that feels like yours."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className="card-hover group rounded-2xl border border-line bg-bg1/70 p-6"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-gradient-to-br from-white/[0.07] to-transparent text-accent-soft transition-all duration-300 group-hover:border-accent/40 group-hover:text-white group-hover:shadow-glow">
                <f.icon size={20} />
              </div>
              <h3 className="font-display text-[15px] font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-dim">{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
