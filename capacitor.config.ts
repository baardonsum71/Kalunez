import type { CapacitorConfig } from '@capacitor/cli';

// Bundle ID must match the App ID registered in Apple Developer for
// Sign in with Apple (see docs/APPLE_SIGNIN_SETUP.md) and, later, App Store Connect.
const config: CapacitorConfig = {
  appId: 'com.kalunez.app',
  appName: 'Kalunez',
  webDir: 'dist',
  backgroundColor: '#020d1a',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#020d1a',
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#020d1a',
      overlaysWebView: true,
    },
    Keyboard: {
      resize: 'body',
    },
  },
};

export default config;
