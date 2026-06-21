import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import PageLoader from '@/components/PageLoader';
import PageViewTracker from '@/components/PageViewTracker';
import AnalyticsProvider from '@/components/AnalyticsProvider';

const Home = lazy(() => import('@/pages/Home'));
const Discover = lazy(() => import('@/pages/Discover'));
const Library = lazy(() => import('@/pages/Library'));
const Playlists = lazy(() => import('@/pages/Playlists'));
const Live = lazy(() => import('@/pages/Live'));
const ForArtists = lazy(() => import('@/pages/ForArtists'));
const Upload = lazy(() => import('@/pages/Upload'));
const Settings = lazy(() => import('@/pages/Settings'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Dmca = lazy(() => import('@/pages/Dmca'));
const Cookies = lazy(() => import('@/pages/Cookies'));
const CookieConsent = lazy(() => import('@/components/CookieConsent'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const GoLive = lazy(() => import('@/pages/GoLive'));
const ArchivePage = lazy(() => import('@/pages/Archive'));
const ArtistDashboard = lazy(() => import('@/pages/ArtistDashboard'));
const Messages = lazy(() => import('@/pages/Messages'));
const MessageThread = lazy(() => import('@/pages/MessageThread'));
const TrackDetail = lazy(() => import('@/pages/TrackDetail'));
const NotificationCenter = lazy(() => import('@/pages/NotificationCenter'));
const VodDetail = lazy(() => import('@/pages/VodDetail'));
const StreamDetail = lazy(() => import('@/pages/StreamDetail'));
const ProSubscription = lazy(() => import('@/pages/ProSubscription'));
const CollabRoom = lazy(() => import('@/pages/CollabRoom'));
const ActivityFeed = lazy(() => import('@/pages/ActivityFeed'));
const ArtistProfile = lazy(() => import('@/pages/ArtistProfile'));
const Analytics = lazy(() => import('@/pages/Analytics'));

const LoginPrompt = () => {
  const { navigateToLogin } = useAuth();
  return (
    <div className="hero-gradient min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <h2 className="text-xl font-bold text-white mb-2">Sign in required</h2>
        <p className="text-muted-foreground mb-6">Create a free account or sign in to access this feature.</p>
        <button
          type="button"
          onClick={() => navigateToLogin()}
          className="gradient-bg text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-purple-900 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/library" element={<Library />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/live" element={<Live />} />
          <Route path="/for-artists" element={<ForArtists />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/dmca" element={<Dmca />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/track/:id" element={<TrackDetail />} />
          <Route path="/vod/:id" element={<VodDetail />} />
          <Route path="/stream/:id" element={<StreamDetail />} />
          <Route path="/activity" element={<ActivityFeed />} />
          <Route path="/artist/:name" element={<ArtistProfile />} />

          <Route element={<ProtectedRoute unauthenticatedElement={<LoginPrompt />} />}>
            <Route path="/upload" element={<Upload />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/go-live" element={<GoLive />} />
            <Route path="/artist-dashboard" element={<ArtistDashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:threadId" element={<MessageThread />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/subscription" element={<ProSubscription />} />
            <Route path="/collab/:draftId" element={<CollabRoom />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AnalyticsProvider>
              <PageViewTracker />
              <AuthenticatedApp />
              <Suspense fallback={null}>
                <CookieConsent />
              </Suspense>
            </AnalyticsProvider>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
