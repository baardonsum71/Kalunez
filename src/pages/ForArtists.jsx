import { Link } from 'react-router-dom';
import { Upload, Radio, TrendingUp, Globe, Shield, Zap, DollarSign, Tv2 } from 'lucide-react';

const features = [
  { icon: Tv2, title: 'Go Live', desc: 'Hit the booth from your browser — or pipe OBS via RTMP when you want the full rig.' },
  { icon: DollarSign, title: 'Tips & tickets', desc: 'Earn from the floor: tips mid-set, optional ticketed nights, subscriptions.' },
  { icon: Globe, title: 'Global floor', desc: 'Your set reaches listeners who could never fit in the room — same energy, wider reach.' },
  { icon: TrendingUp, title: 'Read the room', desc: 'Plays, tips, and audience signals so you know what hits.' },
  { icon: Shield, title: 'Your masters', desc: 'Upload originals you own. You keep the rights — we host and stream.' },
  { icon: Zap, title: 'Drop fast', desc: 'Upload and publish in minutes. No label queue. No waiting for a green light.' },
];

export default function ForArtists() {
  return (
    <div className="hero-gradient min-h-screen">
      <section className="relative min-h-[85svh] flex items-end md:items-center overflow-hidden club-grain">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 55% at 70% 35%, rgba(200, 245, 66, 0.2), transparent 55%),
              radial-gradient(ellipse 60% 50% at 20% 80%, rgba(255, 45, 149, 0.22), transparent 50%),
              linear-gradient(160deg, #050507 0%, #12081a 50%, #050507 100%)
            `,
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-[#050507]/40" aria-hidden />
        <div className="hero-sweep" aria-hidden />

        <div className="relative z-[2] w-full max-w-6xl mx-auto px-4 pt-[calc(6rem+var(--safe-top))] pb-16 md:pb-24">
          <p className="font-display text-sm tracking-[0.25em] text-[var(--lime)] mb-3">FOR ARTISTS</p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl text-white leading-[0.92] mb-4 max-w-3xl">
            OWN THE<br />
            <span className="gradient-text">MAIN ROOM</span>
          </h1>
          <p className="text-white/75 max-w-md mb-8 text-base md:text-lg">
            Upload. Go live. Collect tips. Ticket the night. Built for DJs and artists who run the floor.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/upload"
              className="gradient-bg px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 justify-center hover:opacity-90 transition-opacity text-sm uppercase tracking-wide"
            >
              <Upload className="w-5 h-5" /> Drop a track
            </Link>
            <Link
              to="/go-live"
              className="border border-white/25 bg-black/40 text-white px-8 py-3.5 rounded-xl font-semibold flex items-center gap-2 justify-center hover:border-[var(--magenta)]/50 transition-colors text-sm"
            >
              <Radio className="w-5 h-5" /> Go Live
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <h2 className="font-display text-4xl md:text-5xl text-white mb-3 tracking-wide">THE RIG</h2>
        <p className="text-muted-foreground mb-10 max-w-xl text-sm md:text-base">
          Everything between the booth and the crowd — without the SaaS brochure tone.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="card-lift border border-white/10 bg-white/[0.03] rounded-xl p-6"
            >
              <div className="w-11 h-11 rounded-lg gradient-bg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-2xl text-white mb-2 tracking-wide">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="border border-white/10 bg-black/40 rounded-2xl p-8 md:p-10">
          <h2 className="font-display text-3xl text-white mb-4 tracking-wide">YOUR MUSIC, YOUR CALL</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Kalunez is for <strong className="text-white">original uploads</strong> — not ripped catalogs.
            When you upload or go live, you confirm you own the recording (or have permission) and cleared samples, covers, and artwork.
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 mb-6 list-disc pl-5">
            <li><strong className="text-white">Originals you made</strong> — you keep ownership; we host and stream.</li>
            <li><strong className="text-white">Covers / samples</strong> — clear rights yourself before upload.</li>
            <li><strong className="text-white">Never upload</strong> rips from Spotify, Apple Music, or YouTube.</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            See{' '}
            <Link to="/terms" className="text-[var(--lime)] hover:underline">Terms</Link> and{' '}
            <Link to="/dmca" className="text-[var(--lime)] hover:underline">DMCA</Link>.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 px-8 py-12 md:px-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,245,66,0.12)] to-[rgba(255,45,149,0.12)]" />
          <div className="relative">
            <h2 className="font-display text-5xl md:text-6xl text-white mb-3 tracking-wide">SOUNDCHECK?</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Create your profile, drop a track or go live — the floor is open.
            </p>
            <Link
              to="/upload"
              className="gradient-bg px-10 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <Upload className="w-5 h-5" /> Get on the decks
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
