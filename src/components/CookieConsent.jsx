import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import {
  CONSENT_ALL,
  CONSENT_ESSENTIAL,
  getCookieConsent,
  hasConsentChoice,
  setCookieConsent,
} from '@/lib/cookieConsent';
import { applyConsentToServices } from '@/lib/applyConsent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasConsentChoice()) {
      setVisible(true);
      return;
    }
    applyConsentToServices(getCookieConsent());
  }, []);

  useEffect(() => {
    const onConsent = () => setVisible(false);
    window.addEventListener('kalunez:cookie-consent', onConsent);
    return () => window.removeEventListener('kalunez:cookie-consent', onConsent);
  }, []);

  const accept = (value) => {
    setCookieConsent(value);
    applyConsentToServices(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[60] bg-gradient-to-br from-[#041424] to-[#061c2e] border border-cyan-500/30 rounded-2xl shadow-2xl p-5"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 gradient-bg rounded-full flex items-center justify-center shrink-0">
          <Cookie className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 id="cookie-consent-title" className="text-white font-semibold text-sm">Cookies on Kalunez</h2>
          <p id="cookie-consent-desc" className="text-muted-foreground text-xs mt-1 leading-relaxed">
            We use essential cookies to run the app and optional analytics to improve the experience. See our{' '}
            <Link to="/cookies" className="text-purple-400 hover:underline">Cookie Policy</Link>.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => accept(CONSENT_ALL)}
          className="flex-1 gradient-bg text-white text-sm font-semibold py-2.5 px-4 rounded-full hover:opacity-90 transition-opacity"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={() => accept(CONSENT_ESSENTIAL)}
          className="flex-1 bg-white/10 text-white text-sm font-medium py-2.5 px-4 rounded-full hover:bg-white/15 transition-colors"
        >
          Essential only
        </button>
      </div>
    </div>
  );
}

export function CookieConsentSettings() {
  const [choice, setChoice] = useState(() => getCookieConsent());

  useEffect(() => {
    const sync = () => setChoice(getCookieConsent());
    window.addEventListener('kalunez:cookie-consent', sync);
    return () => window.removeEventListener('kalunez:cookie-consent', sync);
  }, []);

  const update = (value) => {
    setCookieConsent(value);
    applyConsentToServices(value);
    setChoice(value);
  };

  return (
    <div className="py-2 border-b border-border">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="flex items-center gap-2 text-foreground text-sm">
          <Cookie className="w-4 h-4 text-amber-400" /> Cookie preferences
        </span>
        <Link to="/cookies" className="text-xs text-purple-400 hover:underline">Learn more</Link>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => update(CONSENT_ALL)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            choice === CONSENT_ALL
              ? 'border-purple-500 bg-purple-500/20 text-white'
              : 'border-border text-muted-foreground hover:text-white'
          }`}
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={() => update(CONSENT_ESSENTIAL)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            choice === CONSENT_ESSENTIAL
              ? 'border-purple-500 bg-purple-500/20 text-white'
              : 'border-border text-muted-foreground hover:text-white'
          }`}
        >
          Essential only
        </button>
      </div>
    </div>
  );
}
