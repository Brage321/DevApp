import { useEffect } from 'react';
import { SITE } from '@/lib/config';

interface MetaOptions {
  title: string;
  description?: string;
  /** og:image URL, if any */
  image?: string;
  /** canonical path, defaults to current location */
  path?: string;
  robots?: string;
}

function setMeta(selector: string, attr: string, key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Static-SPA SEO strategy:
 * - Updates <title>, description, canonical, Open Graph and Twitter tags at runtime.
 * - Known limitation: most social crawlers execute no JavaScript, so they will see
 *   the default metadata from index.html. For full crawler support, pair this SPA
 *   with a prerendering/proxy service (see README → SEO).
 */
export function useDocumentMeta({ title, description, image, path, robots }: MetaOptions): void {
  useEffect(() => {
    const fullTitle = title.includes(SITE.name) ? title : `${title} · ${SITE.name}`;
    document.title = fullTitle;

    const desc = description ?? SITE.description;
    setMeta('meta[name="description"]', 'name', 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', desc);

    const url = `${SITE.url}${path ?? window.location.pathname}`;
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    if (image) {
      setMeta('meta[property="og:image"]', 'property', 'og:image', image);
      setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);
    }
    if (robots) {
      setMeta('meta[name="robots"]', 'name', 'robots', robots);
    }
  }, [title, description, image, path, robots]);
}
