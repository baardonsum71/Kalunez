/**
 * Server-side callables (formerly Supabase Edge Functions).
 * Phase 1 of the Firebase migration: client Auth + Firestore are live.
 * LiveKit / Mux / Stripe Connect / analytics aggregations move to
 * Cloud Functions next — see docs/FIREBASE_SETUP.md.
 */
export async function invokeBackend(name, _body = {}) {
  throw new Error(
    `Cloud Function "${name}" is not deployed yet (Firebase migration in progress). See docs/FIREBASE_SETUP.md.`
  );
}
