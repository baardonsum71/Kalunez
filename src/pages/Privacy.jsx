import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Who we are and how to contact us (Data Controller)',
    content: (
      <>
        <p>This privacy policy explains how <strong>Kalunez</strong> ("we", "us", "our") collects and uses your personal data when you use our apps and website.</p>
        <p className="mt-3"><strong>Data Controller:</strong> Kalunez</p>
        <p><strong>Address:</strong> Mjosvegen 7, 2380 Brumunddal, Norway</p>
        <p><strong>Phone:</strong> +47 944 41 564</p>
        <p><strong>Email:</strong> <a href="mailto:support@kalunez.com" className="text-purple-400 hover:underline">support@kalunez.com</a></p>
      </>
    ),
  },
  {
    title: '2. Information we collect',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Account details</strong> (email, name, profile info, referral data).</li>
        <li><strong>Content</strong> you upload (tracks, cover art, podcast audio) and related metadata.</li>
        <li><strong>Usage & device data</strong> (listening/streaming history, likes, follows, playlists; device type, OS, app version, approximate location based on IP). Precise location only if you grant permission.</li>
        <li><strong>Purchases & payments</strong> (plan type, status, timestamps; payment tokens handled by our payment partners — we don't store full card details).</li>
        <li><strong>Communications & support</strong> (messages you send us, feedback, bug reports).</li>
        <li><strong>Community content</strong> (live chat messages, comments, reactions) when you use social features.</li>
      </ul>
    ),
  },
  {
    title: '3. Why we use your data (GDPR legal bases)',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Provide the app and features</strong> (streams, playlists, uploads, chat) — <em>contract</em>.</li>
        <li><strong>Account & security</strong> (authentication, fraud prevention, abuse detection) — <em>legitimate interests</em> and <em>legal obligation</em>.</li>
        <li><strong>Payments & subscriptions</strong> — <em>contract</em> and <em>legal obligation</em>.</li>
        <li><strong>Personalization & recommendations</strong> — <em>legitimate interests</em> or <em>consent</em> where required.</li>
        <li><strong>Analytics and service improvement</strong> — <em>legitimate interests</em>.</li>
        <li><strong>Marketing</strong> (emails/push, where enabled) — <em>consent</em> or <em>legitimate interests</em>, with an easy opt-out.</li>
        <li><strong>Legal compliance</strong> (tax, accounting, requests from authorities) — <em>legal obligation</em>.</li>
      </ul>
    ),
  },
  {
    title: '4. Sharing your information',
    content: (
      <>
        <p className="mb-2">We don't sell your personal data. We share it only with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Service providers</strong> that help us run Kalunez (hosting, storage, analytics, email, content delivery, error monitoring, customer support).</li>
          <li><strong>Payment partners</strong> (e.g., Stripe) to process transactions. They act as independent controllers or processors under their own terms.</li>
          <li><strong>Creators</strong> when you interact with their content (e.g., likes, follows, subscriptions) — we may share aggregated or limited data to enable these features.</li>
          <li><strong>Legal or safety</strong> reasons (court orders, fraud prevention, protecting users and our rights).</li>
          <li><strong>Corporate events</strong> (merger, acquisition) where your data may transfer in accordance with this policy.</li>
        </ul>
      </>
    ),
  },
  {
    title: '5. Cookies and similar technologies',
    content: <p>We use cookies, SDKs, and similar technologies to keep you signed in, remember preferences, measure performance, and personalize content. Where required, we'll ask for consent and provide controls to change your choices. See our <Link to="/cookies" className="text-purple-400 hover:underline">Cookie Policy</Link>.</p>,
  },
  {
    title: '6. How long we keep your data',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Account data — until you delete your account or after required retention periods.</li>
        <li>Content — until you remove it or delete your account (backups may take limited time to purge).</li>
        <li>Payments & invoices — retained per accounting/tax rules.</li>
        <li>Analytics logs — typically 24–36 months in aggregate form.</li>
      </ul>
    ),
  },
  {
    title: '7. International transfers',
    content: <p>We may process data outside your country. When we transfer personal data out of the EEA/UK, we rely on appropriate safeguards such as the European Commission's Standard Contractual Clauses and documented vendor measures.</p>,
  },
  {
    title: '8. Your rights (GDPR/EEA)',
    content: (
      <>
        <p>You may have the right to <strong>access</strong>, <strong>rectify</strong>, <strong>erase</strong>, <strong>restrict</strong>, <strong>object</strong> to certain processing, and <strong>data portability</strong>. Where we rely on consent, you can withdraw it at any time without affecting prior lawful processing.</p>
        <p className="mt-2">To exercise these rights, contact us using the details below. You also have the right to lodge a complaint with the Norwegian Data Protection Authority (<a href="https://www.datatilsynet.no/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Datatilsynet</a>).</p>
      </>
    ),
  },
  {
    title: '9. Children\'s privacy',
    content: <p>Kalunez is not directed to children under 13. If we learn we have collected personal data from a child under 13, we will delete it.</p>,
  },
  {
    title: '10. Safety, moderation, and user content',
    content: <p>We may review or act on reports about content that violates our terms (e.g., illegal content, harassment, copyright infringement). For live chat and interactive areas, your messages may be visible to others and stored to ensure safety and compliance.</p>,
  },
  {
    title: '11. Changes to this policy',
    content: <p>We may update this policy. If changes are material, we will notify you in the app or by email. Please check this page for the latest version.</p>,
  },
  {
    title: '12. Contact us',
    content: (
      <>
        <p><strong>Kalunez</strong></p>
        <p>Mjosvegen 7, 2380 Brumunddal, Norway</p>
        <p>Phone: +47 944 41 564</p>
        <p>Email: <a href="mailto:support@kalunez.com" className="text-purple-400 hover:underline">support@kalunez.com</a></p>
      </>
    ),
  },
];

export default function Privacy() {
  return (
    <div className="hero-gradient min-h-screen">
      <div className="bg-gradient-to-b from-purple-900/30 to-transparent px-4 pt-10 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">Last Updated: November 25, 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-6">
        {/* Intro banner */}
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-5">
          <p className="text-foreground leading-relaxed">
            We're committed to being clear and fair about how we handle your data. This policy explains what we collect, why, and your rights as a user of Kalunez.
          </p>
        </div>

        {sections.map((s, i) => (
          <div key={i} className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-3">{s.title}</h2>
            <div className="text-muted-foreground leading-relaxed space-y-2 text-sm policy-content">
              {s.content}
            </div>
          </div>
        ))}

        {/* Footer CTA */}
        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6 text-center">
          <h3 className="text-white font-semibold text-lg mb-2">Your privacy matters</h3>
          <p className="text-muted-foreground text-sm mb-4">If anything here is unclear, reach out and we'll help.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a href="mailto:support@kalunez.com" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
              ✉️ support@kalunez.com
            </a>
            <span className="text-muted-foreground hidden sm:block">•</span>
            <span className="text-muted-foreground">📞 +47 944 41 564</span>
            <span className="text-muted-foreground hidden sm:block">•</span>
            <span className="text-muted-foreground">📍 Mjosvegen 7, 2380 Brumunddal, Norway</span>
          </div>
        </div>

        <div className="text-center flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</Link>
          <Link to="/dmca" className="text-purple-400 hover:text-purple-300">DMCA Policy</Link>
          <Link to="/cookies" className="text-purple-400 hover:text-purple-300">Cookie Policy</Link>
          <Link to="/" className="text-muted-foreground hover:text-purple-400">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}