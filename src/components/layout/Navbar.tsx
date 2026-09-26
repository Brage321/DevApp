import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Glass navbar + animated mobile menu                                 */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Explore', href: '/explore' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/#faq' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-line bg-bg0/70 backdrop-blur-xl' : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="rounded-lg px-3 py-2 text-sm text-ink-dim transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          {user ? (
            <Button to="/dashboard" variant="secondary" size="sm" icon={<LayoutDashboard size={14} />}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">
                Login
              </Button>
              <Button to="/register" size="sm">
                Create Profile
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-ink transition-colors hover:bg-white/[0.06] md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-line bg-bg0/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-4 pb-6 pt-2">
              {NAV_LINKS.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.25 }}
                >
                  <Link
                    to={l.href}
                    className="block rounded-xl px-3 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-white/[0.05]"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex gap-2.5 pt-3">
                {user ? (
                  <Button to="/dashboard" variant="secondary" className="flex-1">
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button to="/login" variant="secondary" className="flex-1">
                      Login
                    </Button>
                    <Button to="/register" className="flex-1">
                      Create Profile
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
