import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';

const AGENT_EMAIL = 'support@kalunez.com';

const sections = [
  {
    title: '1. Purpose',
    content: (
      <p>Kalunez respects intellectual property rights and expects users to do the same. This policy explains how copyright owners can report infringing material on our platform under the U.S. Digital Millennium Copyright Act ("DMCA") and similar laws in other jurisdictions.</p>
    ),
  },
  {
    title: '2. Designated copyright agent',
    content: (
      <>
        <p className="mb-2">Send DMCA notices and counter-notifications to:</p>
        <p><strong>Kalunez — Copyright Agent</strong></p>
        <p>Mjosvegen 7, 2380 Brumunddal, Norway</p>
        <p>Email: <a href={`mailto:${AGENT_EMAIL}`} className="text-purple-400 hover:underline">{AGENT_EMAIL}</a></p>
        <p className="mt-2 text-xs">Subject line: <em>DMCA Notice</em> or <em>DMCA Counter-Notification</em></p>
      </>
    ),
  },
  {
    title: '3. How to submit a DMCA takedown notice',
    content: (
      <>
        <p className="mb-2">Your notice must include all of the following:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your physical or electronic signature.</li>
          <li>Identification of the copyrighted work you claim has been infringed (or a representative list if multiple works).</li>
          <li>Identification of the material on Kalunez that you claim is infringing, with enough detail for us to locate it (URL, track title, artist name, stream ID, etc.).</li>
          <li>Your contact information (name, address, phone, email).</li>
          <li>A statement that you have a good-faith belief the use is not authorized by the copyright owner, its agent, or the law.</li>
          <li>A statement, under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on the owner's behalf.</li>
        </ul>
        <p className="mt-2">Incomplete notices may delay processing. We may forward your notice to the user who posted the content.</p>
      </>
    ),
  },
  {
    title: '4. What happens after we receive a notice',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>We review valid notices promptly and may remove or disable access to the reported material.</li>
        <li>We may notify the user who uploaded the content and provide an opportunity to submit a counter-notification where applicable.</li>
        <li>We may terminate accounts of repeat infringers in appropriate circumstances.</li>
      </ul>
    ),
  },
  {
    title: '5. Counter-notification',
    content: (
      <>
        <p className="mb-2">If you believe your content was removed by mistake or misidentification, you may send a counter-notification to our agent including:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your physical or electronic signature.</li>
          <li>Identification of the material that was removed and its location before removal.</li>
          <li>A statement under penalty of perjury that you have a good-faith belief the material was removed due to mistake or misidentification.</li>
          <li>Your name, address, phone number, and consent to jurisdiction of the federal district court for your address (or Norway if outside the U.S.), and that you will accept service of process from the complainant.</li>
        </ul>
        <p className="mt-2">If we receive a valid counter-notification, we may restore the content after the statutory waiting period unless the copyright owner initiates legal action.</p>
      </>
    ),
  },
  {
    title: '6. Misrepresentations',
    content: (
      <p>Under the DMCA, anyone who knowingly materially misrepresents that material is infringing, or that material was removed by mistake, may be liable for damages. Please ensure your submission is accurate.</p>
    ),
  },
  {
    title: '7. Non-U.S. rights holders',
    content: (
      <p>If you are outside the United States, you may still report infringement using the same contact details. We handle copyright complaints globally and will take appropriate action under applicable law.</p>
    ),
  },
  {
    title: '8. Other IP concerns',
    content: (
      <p>For trademark disputes or other intellectual property issues not covered by the DMCA, contact us at <a href={`mailto:${AGENT_EMAIL}`} className="text-purple-400 hover:underline">{AGENT_EMAIL}</a> with details of your claim and the content in question.</p>
    ),
  },
];

export default function Dmca() {
  return (
    <div className="hero-gradient min-h-screen">
      <div className="bg-gradient-to-b from-purple-900/30 to-transparent px-4 pt-10 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">DMCA Policy</h1>
          </div>
          <p className="text-muted-foreground">Last Updated: June 20, 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-6">
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-5">
          <p className="text-foreground leading-relaxed">
            Use this page to report copyright infringement on Kalunez or to respond if your content was removed. For general terms, see our <Link to="/terms" className="text-purple-400 hover:underline">Terms of Service</Link>.
          </p>
        </div>

        {sections.map((s, i) => (
          <div key={i} className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-3">{s.title}</h2>
            <div className="text-muted-foreground leading-relaxed space-y-2 text-sm policy-content">{s.content}</div>
          </div>
        ))}

        <div className="text-center flex flex-wrap justify-center gap-4 text-sm">
          <a href={`mailto:${AGENT_EMAIL}?subject=DMCA%20Notice`} className="text-purple-400 hover:text-purple-300">Report infringement</a>
          <Link to="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</Link>
          <Link to="/" className="text-muted-foreground hover:text-purple-400">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
