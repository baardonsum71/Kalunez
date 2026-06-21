import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

const sections = [
  {
    title: '1. What are cookies?',
    content: (
      <p>Cookies are small text files stored on your device. We also use similar technologies such as local storage, session storage, and SDK identifiers to keep you signed in, remember preferences, and understand how the Service is used.</p>
    ),
  },
  {
    title: '2. How we use cookies',
    content: (
      <>
        <p className="mb-3">We group cookies and similar technologies into these categories:</p>
        <div className="space-y-4">
          <div>
            <p className="text-white font-medium">Strictly necessary</p>
            <p className="mt-1">Required for authentication, security, load balancing, and core playback features. These cannot be disabled if you want to use Kalunez.</p>
          </div>
          <div>
            <p className="text-white font-medium">Functional</p>
            <p className="mt-1">Remember UI preferences such as sidebar state, player settings, and consent choices.</p>
          </div>
          <div>
            <p className="text-white font-medium">Analytics</p>
            <p className="mt-1">Help us measure traffic, feature usage, and product performance (e.g., PostHog). We only enable these with your consent where required by law.</p>
          </div>
          <div>
            <p className="text-white font-medium">Error monitoring</p>
            <p className="mt-1">Help us detect crashes and fix bugs (e.g., Sentry). Session replay, when enabled, is limited to users who accept analytics cookies.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    title: '3. Third-party cookies',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Stripe</strong> — payment processing and fraud prevention when you subscribe or tip.</li>
        <li><strong>PostHog</strong> — product analytics (with consent).</li>
        <li><strong>Sentry</strong> — error reporting and performance monitoring.</li>
        <li><strong>LiveKit / Mux</strong> — live streaming infrastructure when you watch or broadcast.</li>
        <li><strong>Base44</strong> — authentication and backend services.</li>
      </ul>
    ),
  },
  {
    title: '4. Your choices',
    content: (
      <>
        <p className="mb-2">When you first visit Kalunez, we show a cookie banner where you can:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Accept all</strong> — enable analytics and related technologies.</li>
          <li><strong>Essential only</strong> — use Kalunez with strictly necessary and functional storage only.</li>
        </ul>
        <p className="mt-2">You can change your choice anytime in <Link to="/settings" className="text-purple-400 hover:underline">Settings</Link> or by clearing site data in your browser.</p>
        <p className="mt-2">Most browsers also let you block or delete cookies globally. Blocking all cookies may prevent sign-in or playback.</p>
      </>
    ),
  },
  {
    title: '5. Retention',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Session cookies expire when you close the browser.</li>
        <li>Persistent cookies and local storage items typically last up to 12 months unless deleted earlier.</li>
        <li>Analytics data retention follows our <Link to="/privacy" className="text-purple-400 hover:underline">Privacy Policy</Link>.</li>
      </ul>
    ),
  },
  {
    title: '6. Updates and contact',
    content: (
      <>
        <p>We may update this Cookie Policy when we add providers or change how we use cookies. Material changes will be reflected in the "Last Updated" date below.</p>
        <p className="mt-3">Questions: <a href="mailto:support@kalunez.com" className="text-purple-400 hover:underline">support@kalunez.com</a></p>
      </>
    ),
  },
];

export default function Cookies() {
  return (
    <div className="hero-gradient min-h-screen">
      <div className="bg-gradient-to-b from-purple-900/30 to-transparent px-4 pt-10 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
              <Cookie className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Cookie Policy</h1>
          </div>
          <p className="text-muted-foreground">Last Updated: June 20, 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-6">
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-5">
          <p className="text-foreground leading-relaxed">
            This policy explains how Kalunez uses cookies and similar technologies. For broader data practices, see our <Link to="/privacy" className="text-purple-400 hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        {sections.map((s, i) => (
          <div key={i} className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-3">{s.title}</h2>
            <div className="text-muted-foreground leading-relaxed space-y-2 text-sm policy-content">{s.content}</div>
          </div>
        ))}

        <div className="text-center flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
          <Link to="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</Link>
          <Link to="/" className="text-muted-foreground hover:text-purple-400">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
