import React from 'react'
import ReactDOM from 'react-dom/client'

// Register Service Worker for offline audio caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
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