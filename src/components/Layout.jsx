import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Music, Radio, Zap, Mic2, Upload, Menu, X, ChevronLeft, Home, Settings, Tv2, BarChart2, MessageSquare, Bell } from 'lucide-react';
import FloatingPlayer from '@/components/FloatingPlayer';
import Footer from '@/components/Footer';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const ROOT_SCREENS = ['/', '/discover', '/library', '/live'];

const navLinks = [
  { label: 'Discover', href: '/discover', icon: Zap },
  { label: 'Library', href: '/library', icon: Music },
  { label: 'Live', href: '/live', icon: Radio },
  { label: 'For Artists', href: '/for-artists', icon: Mic2 },
  { label: 'Upload', href: '/upload', icon: Upload },
  { label: 'Go Live', href: '/go-live', icon: Tv2 },
  { label: 'Dashboard', href: '/artist-dashboard', icon: BarChart2 },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const bottomNavLinks = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Discover', href: '/discover', icon: Zap },
  { label: 'Library', href: '/library', icon: Music },
  { label: 'Live', href: '/live', icon: Radio },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const scrollPositions = useRef({});

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications-badge', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email, read: false }, '-created_date', 100),
    enabled: isAuthenticated && !!user?.email,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const isRootScreen = ROOT_SCREENS.some(route => location.pathname === route);

  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.current[location.pathname] = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    const savedPos = scrollPositions.current[location.pathname];
    if (savedPos != null) {
      requestAnimationFrame(() => window.scrollTo(0, savedPos));
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background font-inter">
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#020d1a]/95 via-[#041424]/95 to-[#061c2e]/95 backdrop-blur-md border-b border-cyan-500/20 safe-top"
        aria-label="Main navigation"
      >
        {!isRootScreen && (
          <div className="md:hidden flex items-center h-11 px-3 gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="p-2.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-widest logo-gradient-text uppercase">KALUNEZ</span>
            </Link>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 select-none" aria-label="Kalunez home">
            <span className="text-lg font-bold tracking-widest logo-gradient-text uppercase">KALUNEZ</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => {
              const unread = href === '/notifications' ? notifications.length : 0;
              return (
                <Link
                  key={href}
                  to={href}
                  className={`select-none px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative ${
                    location.pathname === href
                      ? 'text-white bg-white/10'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-destructive rounded-full text-white text-xs flex items-center justify-center font-bold px-1">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            className="select-none md:hidden text-muted-foreground hover:text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 px-4 py-3 flex flex-col gap-1">
            {navLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                onClick={() => setMenuOpen(false)}
                className={`select-none flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === href
                    ? 'text-white bg-white/10'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="pt-14 pb-20 md:pb-0 overscroll-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <FloatingPlayer />

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border pb-[--safe-bottom]"
        aria-label="Mobile navigation"
      >
        <div className="flex">
          {bottomNavLinks.map(({ label, href, icon: Icon }) => {
            const active = href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);
            return (
              <Link
                key={href}
                to={href}
                onClick={() => {
                  if (active) window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                aria-current={active ? 'page' : undefined}
                className={`select-none flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-sm font-medium transition-colors h-11 ${
                  active ? 'text-purple-400' : 'text-muted-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-purple-400' : ''}`} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
