import { Link } from 'react-router-dom';

const CONTACT = {
  name: 'Kalunez',
  address: 'Mjosvegen 7, 2380 Brumunddal, Norway',
  phone: '+47 944 41 564',
  email: 'support@kalunez.com',
};

const sections = [
  {
    title: '1. Agreement to these Terms',
    content: (
      <>
        <p>These Terms of Service ("Terms") govern your access to and use of <strong>Kalunez</strong> ("Kalunez", "we", "us", "our"), including our website, mobile experiences, and related services (collectively, the "Service").</p>
        <p className="mt-2">By creating an account, accessing, or using the Service, you agree to these Terms and our <Link to="/privacy" className="text-purple-400 hover:underline">Privacy Policy</Link>. If you do not agree, do not use the Service.</p>
      </>
    ),
  },
  {
    title: '2. Who may use Kalunez',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>You must be at least <strong>13 years old</strong> (or the minimum age required in your country) to use the Service.</li>
        <li>If you are under 18, you represent that you have permission from a parent or legal guardian.</li>
        <li>You may not use the Service if you are barred under applicable law or previously suspended by us.</li>
      </ul>
    ),
  },
  {
    title: '3. Your account',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>You are responsible for keeping your login credentials secure and for all activity under your account.</li>
        <li>Provide accurate information and keep your profile up to date.</li>
        <li>Notify us promptly at <a href={`mailto:${CONTACT.email}`} className="text-purple-400 hover:underline">{CONTACT.email}</a> if you suspect unauthorized access.</li>
        <li>We may suspend or terminate accounts that violate these Terms or pose a risk to users or the platform.</li>
      </ul>
    ),
  },
  {
    title: '4. The Service',
    content: (
      <>
        <p className="mb-2">Kalunez is a music streaming and creator platform. Depending on your plan and role, you may:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Stream and discover music, podcasts, and live audio/video content.</li>
          <li>Create playlists, follow artists, and interact with community features.</li>
          <li>Upload tracks and metadata as an artist or rights holder.</li>
          <li>Broadcast live streams and participate in live chat.</li>
          <li>Subscribe to paid plans, send tips, and receive payouts through our payment partners.</li>
        </ul>
        <p className="mt-2">Features may change, be added, or be discontinued. We strive for high availability but do not guarantee uninterrupted access.</p>
      </>
    ),
  },
  {
    title: '5. Subscriptions, tips, and payments',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Paid subscriptions and tips are processed by third-party payment providers (e.g., Stripe). Their terms also apply to payment transactions.</li>
        <li>Subscription fees, billing cycles, and cancellation terms are shown at checkout and on our <Link to="/pricing" className="text-purple-400 hover:underline">Pricing</Link> page.</li>
        <li>Unless required by law, fees are non-refundable once a billing period has started. You may cancel renewal at any time through your account settings.</li>
        <li>Artist payouts and Connect onboarding are subject to eligibility, verification, and the payment partner's policies.</li>
        <li>We may change pricing with reasonable notice. Continued use after a price change constitutes acceptance for future billing periods.</li>
      </ul>
    ),
  },
  {
    title: '6. User content and licenses',
    content: (
      <>
        <p className="mb-2">You retain ownership of content you upload ("User Content"), including music, artwork, streams, chat messages, and profile materials. By uploading or posting User Content, you represent that:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>You own the content or have all rights, licenses, and permissions needed to make it available on Kalunez.</li>
          <li>Your User Content does not infringe copyright, trademark, privacy, or other rights of any person.</li>
        </ul>
        <p className="mt-3 mb-2">You grant Kalunez a worldwide, non-exclusive, royalty-free license to host, store, reproduce, distribute, publicly perform, display, and adapt your User Content solely to operate, promote, and improve the Service — including generating streams, previews, thumbnails, and recommendations.</p>
        <p>This license ends when you delete the content or your account, except where retention is required by law, for backup cycles, or to resolve disputes.</p>
      </>
    ),
  },
  {
    title: '7. Acceptable use',
    content: (
      <>
        <p className="mb-2">You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Upload or share content you do not have rights to, including unauthorized recordings or samples.</li>
          <li>Harass, threaten, defame, or discriminate against others.</li>
          <li>Post illegal, obscene, or exploitative material, or content that promotes violence or self-harm.</li>
          <li>Manipulate charts, streams, followers, or payouts through bots or fraudulent activity.</li>
          <li>Reverse engineer, scrape, or overload the Service except through documented APIs we provide.</li>
          <li>Circumvent geographic, DRM, or access restrictions without authorization.</li>
          <li>Use the Service for spam, malware, phishing, or unauthorized advertising.</li>
        </ul>
        <p className="mt-2">We may remove content, restrict features, or terminate accounts for violations.</p>
      </>
    ),
  },
  {
    title: '8. Copyright and DMCA',
    content: (
      <>
        <p>We respect intellectual property rights. If you believe content on Kalunez infringes your copyright, please follow our <Link to="/dmca" className="text-purple-400 hover:underline">DMCA Policy</Link> to submit a notice. Repeat infringers may have their accounts terminated.</p>
        <p className="mt-2">If you believe your content was removed in error, you may submit a counter-notification as described in that policy.</p>
      </>
    ),
  },
  {
    title: '9. Live streams and community features',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Live chat, comments, and messages may be visible to other users and moderated by us or automated systems.</li>
        <li>You are responsible for what you broadcast and say during live sessions.</li>
        <li>We may record, review, or retain streams and chat for safety, compliance, quality, and support.</li>
        <li>Do not share personal data of others without consent in public areas of the Service.</li>
      </ul>
    ),
  },
  {
    title: '10. Third-party services',
    content: (
      <p>The Service integrates third-party providers for hosting, streaming, analytics, error monitoring, payments, and authentication. Your use of those features may be subject to their separate terms and privacy policies. We are not responsible for third-party sites or services linked from Kalunez.</p>
    ),
  },
  {
    title: '11. Disclaimers',
    content: (
      <p>The Service is provided <strong>"as is"</strong> and <strong>"as available"</strong> without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee that content on the platform is accurate, complete, or lawful. You use User Content and creator offerings at your own risk.</p>
    ),
  },
  {
    title: '12. Limitation of liability',
    content: (
      <p>To the fullest extent permitted by law, Kalunez and its officers, directors, employees, and suppliers will not be liable for indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, goodwill, or business opportunities arising from your use of the Service. Our total liability for any claim relating to the Service is limited to the greater of (a) amounts you paid us in the twelve months before the claim or (b) USD $100, except where such limits are prohibited by law.</p>
    ),
  },
  {
    title: '13. Indemnification',
    content: (
      <p>You agree to defend, indemnify, and hold harmless Kalunez from claims, damages, losses, and expenses (including reasonable legal fees) arising from your User Content, your use of the Service, or your violation of these Terms or applicable law.</p>
    ),
  },
  {
    title: '14. Termination',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>You may stop using the Service and delete your account at any time through settings or by contacting us.</li>
        <li>We may suspend or terminate access immediately for breach, legal requirements, or platform risk.</li>
        <li>Sections that by nature should survive termination (licenses granted for operational needs, disclaimers, liability limits, dispute terms) will survive.</li>
      </ul>
    ),
  },
  {
    title: '15. Governing law and disputes',
    content: (
      <>
        <p>These Terms are governed by the laws of <strong>Norway</strong>, without regard to conflict-of-law rules.</p>
        <p className="mt-2">If you are a consumer in the EEA, you may also benefit from mandatory protections of your country of residence. Disputes should first be raised with us at <a href={`mailto:${CONTACT.email}`} className="text-purple-400 hover:underline">{CONTACT.email}</a>. Where required by law, you may bring claims in your local courts.</p>
      </>
    ),
  },
  {
    title: '16. Changes to these Terms',
    content: (
      <p>We may update these Terms from time to time. If changes are material, we will provide notice in the Service or by email. The "Last Updated" date below reflects the latest version. Continued use after changes take effect constitutes acceptance.</p>
    ),
  },
  {
    title: '17. Contact',
    content: (
      <>
        <p><strong>{CONTACT.name}</strong></p>
        <p>{CONTACT.address}</p>
        <p>Phone: {CONTACT.phone}</p>
        <p>Email: <a href={`mailto:${CONTACT.email}`} className="text-purple-400 hover:underline">{CONTACT.email}</a></p>
      </>
    ),
  },
];

export default function Terms() {
  return (
    <div className="hero-gradient min-h-screen">
      <div className="bg-gradient-to-b from-purple-900/30 to-transparent px-4 pt-10 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm">TOS</div>
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          </div>
          <p className="text-muted-foreground">Last Updated: June 20, 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-6">
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-5">
          <p className="text-foreground leading-relaxed">
            These Terms explain your rights and responsibilities when using Kalunez. Please read them carefully before uploading content, going live, or purchasing a subscription.
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
          <Link to="/dmca" className="text-purple-400 hover:text-purple-300">DMCA Policy</Link>
          <Link to="/cookies" className="text-purple-400 hover:text-purple-300">Cookie Policy</Link>
          <Link to="/" className="text-muted-foreground hover:text-purple-400">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
