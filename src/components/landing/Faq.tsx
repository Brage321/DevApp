import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SectionHeading } from '@/components/ui/Surfaces';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'What is Kloa.lol?',
    a: 'Kloa.lol is a place for your links, your personality, and the stuff you want people to find in one clean spot. Think personal homepage, but simpler and a little more fun.',
  },
  {
    q: 'How much does it cost?',
    a: 'The basic version is free. If you want more links, music, effects, or deeper analytics, the paid plans are there when you need them.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'That is on the roadmap, but it is not live yet. For now, your kloa.lol/username works just fine and feels clean enough on its own.',
  },
  {
    q: 'Is my data private?',
    a: 'We keep the essentials needed to run the product and keep things working. No creepy ad tracking, no selling your data, and the analytics stay pretty minimal by design.',
  },
  {
    q: 'Can I keep my username?',
    a: 'Usernames are claimed on a first-come basis while your account stays active. Pick something you want to live with for a while.',
  },
  {
    q: 'Does Kloa.lol work on mobile?',
    a: 'Yep. The editor and profile layout are built to feel solid on a phone, tablet, or laptop without feeling cramped.',
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 py-24" aria-label="Frequently asked questions">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading center title="Questions, answered" />
        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={cn(
                  'overflow-hidden rounded-2xl border transition-colors duration-300',
                  isOpen ? 'border-line-strong bg-bg1/90' : 'border-line bg-bg1/50'
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-display text-[15px] font-semibold text-white">{f.q}</span>
                  <ChevronDown
                    size={17}
                    className={cn(
                      'shrink-0 text-ink-faint transition-transform duration-300',
                      isOpen && 'rotate-180 text-accent-soft'
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-ink-dim">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
