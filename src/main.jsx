import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'

// Register Service Worker for offline audio caching (web/PWA only — not used
// inside the native Capacitor shell, which has its own asset bundling).
if ('serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}

if (Capacitor.isNativePlatform()) {
  import('@/lib/nativeBootstrap').then((m) => m.initNativeShell());
}

import App from '@/App.jsx'
import '@/index.css'
import { getCookieConsent } from '@/lib/cookieConsent'
import { applyConsentToServices } from '@/lib/applyConsent'

const savedConsent = getCookieConsent()
if (savedConsent) {
  applyConsentToServices(savedConsent)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)