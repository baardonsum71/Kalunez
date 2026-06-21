import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-cyan-500/20 bg-gradient-to-br from-[#020d1a] via-[#041424] to-[#061c2e] mt-10">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <span className="text-xl font-bold tracking-widest logo-gradient-text uppercase">KALUNEZ</span>
            <p className="text-muted-foreground text-sm mt-2 max-w-xs">
              Stream, create, and connect. The music platform built for artists and fans worldwide.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/discover" className="text-muted-foreground hover:text-white transition-colors">Discover Music</Link></li>
              <li><Link to="/live" className="text-muted-foreground hover:text-white transition-colors">Live Streams</Link></li>
              <li><Link to="/library" className="text-muted-foreground hover:text-white transition-colors">My Library</Link></li>
              <li><Link to="/activity" className="text-muted-foreground hover:text-white transition-colors">Activity Feed</Link></li>
            </ul>
          </div>

          {/* Artists & Info */}
          <div>
            <h4 className="text-white font-semibold mb-3">Artists & Info</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/for-artists" className="text-muted-foreground hover:text-white transition-colors">For Artists</Link></li>
              <li><Link to="/upload" className="text-muted-foreground hover:text-white transition-colors">Upload Music</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/dmca" className="text-muted-foreground hover:text-white transition-colors">DMCA</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground hover:text-white transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
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