import { Link } from 'react-router-dom';
import { Mic2, Upload, Radio, TrendingUp, Globe, Shield, Zap, DollarSign } from 'lucide-react';

const features = [
  { icon: Globe, title: 'Global Reach', desc: 'Share your music with listeners anywhere — from home studio to world stage.' },
  { icon: Radio, title: 'Live Streaming', desc: 'Go live anytime, from your bedroom studio or on stage.' },
  { icon: TrendingUp, title: 'Analytics', desc: 'Track your plays, likes, and audience growth in real time.' },
  { icon: DollarSign, title: 'Monetize', desc: 'Earn from your music through tips, subscriptions, and more.' },
  { icon: Shield, title: 'You Keep Your Rights', desc: 'Upload only your own music. You retain ownership — Kalunez hosts and streams it on your behalf.' },
  { icon: Zap, title: 'Instant Upload', desc: 'Upload and publish your tracks in minutes, not days.' },
];

export default function ForArtists() {
  return (
    <div className="hero-gradient min-h-screen">
      {/* Hero */}
      <section className="relative pt-20 pb-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-pink-700/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <Mic2 className="w-4 h-4" /> For Artists
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-5 leading-tight">
            Your Stage.<br />
            <span className="gradient-text">The Entire World.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Upload original tracks, go live, and build your audience — on your own terms.
            No label required. No waiting for approval.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/upload" className="gradient-bg text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 justify-center hover:opacity-90 transition-opacity">
              <Upload className="w-5 h-5" /> Upload Your Music
            </Link>
            <Link to="/go-live" className="border border-white/30 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 justify-center hover:bg-white/10 transition-colors">
              <Radio className="w-5 h-5" /> Start Streaming
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-cyan-900/30 to-teal-900/20 border border-cyan-500/20 rounded-2xl overflow-hidden grid md:grid-cols-2">
          <div className="p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-white mb-4">Stream from anywhere</h2>
            <p className="text-muted-foreground mb-6">
              Upload tracks in minutes or go live from your browser. Use OBS with RTMP when you want a pro setup.
              No expensive venue — just you and your music.
            </p>
            <Link to="/go-live" className="gradient-bg text-white w-fit px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
              <Radio className="w-4 h-4" /> Try Go Live →
            </Link>
          </div>
          <div className="relative min-h-48 bg-gradient-to-br from-purple-900/40 to-cyan-900/30 flex items-center justify-center">
            <div className="text-center p-8">
              <Mic2 className="w-16 h-16 text-purple-400/60 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Your content. Your rights. Your audience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Everything You Need to Succeed</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400/50 transition-all">
              <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rights & licensing */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/20 border border-purple-500/20 rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl font-bold text-white mb-4">Your music, your responsibility</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Kalunez is a platform for <strong className="text-foreground">original uploads</strong> — not a catalog from Spotify or other streaming services.
            When you upload or go live, you confirm that you own the recording (or have permission) and that you have cleared samples, covers, and artwork.
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 mb-6 list-disc pl-5">
            <li><strong className="text-foreground">Original music you wrote and recorded</strong> — you typically own the rights. You grant Kalunez permission to host and stream it.</li>
            <li><strong className="text-foreground">Covers, samples, or beats you don't fully control</strong> — you must get the necessary permissions yourself before uploading.</li>
            <li><strong className="text-foreground">Never upload</strong> rips from Spotify, Apple Music, YouTube, or any source you don't have rights to.</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Kalunez does not provide legal advice. See our{' '}
            <Link to="/terms" className="text-purple-400 hover:underline">Terms of Service</Link> and{' '}
            <Link to="/dmca" className="text-purple-400 hover:underline">DMCA Policy</Link> for details.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-24 text-center">
        <div className="bg-gradient-to-r from-cyan-900/40 to-teal-900/30 border border-cyan-500/30 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Be Heard?</h2>
          <p className="text-muted-foreground mb-8">Create your artist profile, upload your first track, and start building your audience today.</p>
          <Link to="/upload" className="gradient-bg text-white px-10 py-3.5 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2">
            <Upload className="w-5 h-5" /> Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}