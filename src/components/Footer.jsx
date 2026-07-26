import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black mt-10">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <span className="font-display text-3xl tracking-wide logo-gradient-text">KALUNEZ</span>
            <p className="text-muted-foreground text-sm mt-2 max-w-xs">
              Live sets, tips, and ticketed nights — the stream that feels like the club.
            </p>
          </div>

          <div>
            <h4 className="font-display text-xl text-white mb-3 tracking-wide">EXPLORE</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/discover" className="text-muted-foreground hover:text-[var(--lime)] transition-colors">Discover</Link></li>
              <li><Link to="/live" className="text-muted-foreground hover:text-[var(--lime)] transition-colors">Live</Link></li>
              <li><Link to="/library" className="text-muted-foreground hover:text-[var(--lime)] transition-colors">Library</Link></li>
              <li><Link to="/activity" className="text-muted-foreground hover:text-[var(--lime)] transition-colors">Activity</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xl text-white mb-3 tracking-wide">ARTISTS & INFO</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/for-artists" className="text-muted-foreground hover:text-[var(--lime)] transition-colors">For Artists</Link></li>
              <li><Link to="/upload" className="text-muted-foreground hover:text-[var(--lime)] transition-colors">Upload</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-[var(--lime)] transition-colors">Pricing</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-[var(--lime)] transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-[var(--lime)] transition-colors">Terms</Link></li>
              <li><Link to="/dmca" className="text-muted-foreground hover:text-[var(--lime)] transition-colors">DMCA</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground hover:text-[var(--lime)] transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Kalunez. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/dmca" className="hover:text-white transition-colors">DMCA</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
