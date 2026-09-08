import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/api/firebaseClient';

/**
 * Call a Firebase Cloud Function (callable).
 * Names match former Supabase Edge Function names.
 */
export async function invokeBackend(name, body = {}) {
  const functions = getFunctions(firebaseApp, 'us-central1');
  const fn = httpsCallable(functions, name);
  try {
    const result = await fn(body);
    return result.data;
  } catch (err) {
    const code = err?.code || '';
    const message = err?.message || String(err);
    if (code === 'functions/not-found' || /NOT_FOUND|not been deployed/i.test(message)) {
      throw new Error(
        `Cloud Function "${name}" is not deployed yet. Upgrade Firebase to Blaze and deploy — see docs/FIREBASE_SETUP.md.`
      );
    }
    throw new Error(message.replace(/^Firebase:\s*/i, '').replace(/\s*\(.*\)$/, '') || message);
  }
}

/** Public HTTPS URL for the RevenueCat webhook (set in RevenueCat dashboard). */
export function revenueCatWebhookUrl() {
  return `https://us-central1-kalunez-app.cloudfunctions.net/handleRevenueCatWebhook`;
}
