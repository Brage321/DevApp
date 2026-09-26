import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Compass, ArrowDown } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EmptyState, Skeleton } from '@/components/ui/Surfaces';
import { Button } from '@/components/ui/Button';
import { ProfileCard } from '@/components/explore/ProfileCard';
import { useDebounce } from '@/hooks/useDebounce';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { getBackend } from '@/services/backend';
import type { ExploreSort, PublicProfileSummary } from '@/types';
import { cn, formatNumber } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Explore — searchable, paginated directory of public profiles.       */
/* Search is debounced; results load page-by-page (never thousands).   */
/* ------------------------------------------------------------------ */

const TABS: { id: ExploreSort; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'trending', label: 'Trending' },
  { id: 'new', label: 'New' },
  { id: 'popular', label: 'Popular' },
];

const PAGE_SIZE = 8;

export default function Explore() {
  useDocumentMeta({
    title: 'Explore profiles',
    description: 'Discover creative Kloa.lol profiles — search by username or display name.',
    path: '/explore',
  });

  const [sort, setSort] = useState<ExploreSort>('featured');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [items, setItems] = useState<PublicProfileSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(
    async (sortId: ExploreSort, search: string, pageNum: number, append: boolean) => {
      const id = ++requestId.current;
      if (!append) setLoading(true);
      setError(false);
      try {
        const res = await getBackend().profiles.listExplore({
          sort: sortId,
          search: search || undefined,
          page: pageNum,
          pageSize: PAGE_SIZE,
        });
        if (id !== requestId.current) return;
        setItems((prev) => (append ? [...prev, ...res.items] : res.items));
        setHasMore(res.hasMore);
        setTotal(res.total);
      } catch {
        if (id === requestId.current) setError(true);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    void load(sort, debouncedQuery, 1, false);
  }, [sort, debouncedQuery, load]);

  return (
    <div className="flex min-h-screen flex-col bg-bg0">
      <Navbar />
      <main className="flex-1 pb-24 pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-display-md font-bold text-white">Explore</h1>
              <p className="mt-1.5 text-sm text-ink-dim">
                {loading && !items.length ? 'Loading profiles…' : `${formatNumber(total)} public profiles`}
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search username or name…"
                aria-label="Search profiles"
                className="input-base pl-10"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl border border-line bg-white/[0.03] p-1 sm:w-fit">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSort(t.id)}
                className={cn(
                  'whitespace-nowrap rounded-lg px-4 py-2 text-[13px] font-medium transition-all duration-200',
                  sort === t.id ? 'bg-white/[0.09] text-white' : 'text-ink-dim hover:text-ink'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error ? (
            <div className="mt-10">
              <EmptyState
                icon={<Compass size={20} />}
                title="Unable to load profiles"
                description="Something went wrong. Please try again."
                action={
                  <Button variant="secondary" onClick={() => void load(sort, debouncedQuery, page, false)}>
                    Retry
                  </Button>
                }
              />
            </div>
          ) : loading && !items.length ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-line p-4">
                  <Skeleton className="h-20 w-full" />
                  <div className="mt-3 flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="mt-3 h-3 w-full" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                icon={<Search size={20} />}
                title="No profiles found"
                description={
                  query ? `Nothing matches "${query}". Try a different search.` : 'Be the first to create a profile!'
                }
                action={<Button to="/register">Create your profile</Button>}
              />
            </div>
          ) : (
            <>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((p) => (
                  <ProfileCard key={p.username} profile={p} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button
                    variant="secondary"
                    loading={loading}
                    icon={<ArrowDown size={15} />}
                    onClick={() => {
                      const next = page + 1;
                      setPage(next);
                      void load(sort, debouncedQuery, next, true);
                    }}
                  >
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
