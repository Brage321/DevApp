import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

/* ------------------------------------------------------------------ */
/* Shared shell for legal/static content pages                         */
/* ------------------------------------------------------------------ */

export function LegalPage({
  title,
  description,
  path,
  children,
}: {
  title: string;
  description: string;
  path: string;
  children: ReactNode;
}) {
  useDocumentMeta({ title, description, path });
  return (
    <div className="flex min-h-screen flex-col bg-bg0">
      <Navbar />
      <main className="flex-1 pb-24 pt-32">
        <article className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="font-display text-display-md font-bold text-white">{title}</h1>
          <p className="mt-3 text-sm text-ink-faint">Last updated: September 2026</p>
          <div className="prose-kloa mt-10 space-y-6 text-[15px] leading-relaxed text-ink-dim [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
