// Kloa.lol — SPA fallback generator for Surge.sh static hosting.
//
// Surge serves `200.html` for any URL that does not match a static file.
// Copying index.html to 200.html makes client-side routes like
// kloa.lol/<username>, /dashboard, /explore resolve to the SPA.
// A copy at 404.html also keeps unknown paths inside the app, where the
// React router renders the styled 404 page.
import { copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const index = resolve(dist, 'index.html');

if (!existsSync(index)) {
  console.error('[spa-fallback] dist/index.html not found — run `vite build` first.');
  process.exit(1);
}

copyFileSync(index, resolve(dist, '200.html'));
copyFileSync(index, resolve(dist, '404.html'));
console.log('[spa-fallback] wrote dist/200.html and dist/404.html (SPA fallback for Surge).');
