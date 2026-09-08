import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

export const firebaseConfigReady = missing.length === 0;

if (!firebaseConfigReady) {
  // eslint-disable-next-line no-console
  console.error(
    `Missing Firebase env: ${missing.join(', ')}. Copy .env.example → .env.local (see docs/FIREBASE_SETUP.md).`
  );
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp(
    firebaseConfigReady
      ? firebaseConfig
      : {
          apiKey: 'missing',
          authDomain: 'missing',
          projectId: 'missing',
          appId: 'missing',
        }
  );

function createAuth(firebaseApp) {
  // Capacitor iOS WKWebView often hangs forever with default getAuth() persistence.
  try {
    if (Capacitor.isNativePlatform()) {
      return initializeAuth(firebaseApp, {
        persistence: indexedDBLocalPersistence,
      });
    }
  } catch {
    // Auth already initialized (HMR / second import).
  }
  try {
    return getAuth(firebaseApp);
  } catch {
    return initializeAuth(firebaseApp, {
      persistence: browserLocalPersistence,
    });
  }
}

export const firebaseApp = app;
export const auth = createAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
