import { Component, useEffect } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/useToast';
import Landing from '@/pages/Landing';
import Explore from '@/pages/Explore';
import Pricing from '@/pages/Pricing';
import ProfilePage from '@/pages/ProfilePage';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import Verify from '@/pages/auth/Verify';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Overview from '@/pages/dashboard/Overview';
import ProfileSection from '@/pages/dashboard/ProfileSection';
import AppearanceSection from '@/pages/dashboard/AppearanceSection';
import LinksSection from '@/pages/dashboard/LinksSection';
import MusicSection from '@/pages/dashboard/MusicSection';
import EffectsSection from '@/pages/dashboard/EffectsSection';
import ThemesSection from '@/pages/dashboard/ThemesSection';
import AnalyticsSection from '@/pages/dashboard/AnalyticsSection';
import IntegrationsSection from '@/pages/dashboard/IntegrationsSection';
import SettingsSection from '@/pages/dashboard/SettingsSection';
import Admin from '@/pages/Admin';
import Privacy from '@/pages/legal/Privacy';
import Terms from '@/pages/legal/Terms';
import Contact from '@/pages/legal/Contact';

function ScrollManager() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  return null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Development diagnostics only — never surfaced to users.
    console.error('[kloa] render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-bg0 px-4 text-center">
          <p className="font-display text-6xl font-bold text-gradient">oops</p>
          <h1 className="mt-6 font-display text-2xl font-bold text-white">Something went wrong.</h1>
          <p className="mt-3 max-w-sm text-sm text-ink-dim">
            Please try again. If the problem persists, the page will remember.
          </p>
          <button
            onClick={() => window.location.assign('/')}
            className="mt-8 rounded-xl border border-line-strong bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white/[0.09]"
          >
            Go home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollManager />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Overview />} />
                <Route path="profile" element={<ProfileSection />} />
                <Route path="appearance" element={<AppearanceSection />} />
                <Route path="links" element={<LinksSection />} />
                <Route path="music" element={<MusicSection />} />
                <Route path="effects" element={<EffectsSection />} />
                <Route path="themes" element={<ThemesSection />} />
                <Route path="analytics" element={<AnalyticsSection />} />
                <Route path="integrations" element={<IntegrationsSection />} />
                <Route path="settings" element={<SettingsSection />} />
              </Route>
              <Route path="/admin" element={<Admin />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              {/* Public profiles: kloa.lol/:username (kept last on purpose) */}
              <Route path="/:username" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
