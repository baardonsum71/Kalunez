import * as Sentry from '@sentry/react';

let initialized = false;

export function isSentryEnabled() {
  return initialized;
}

export function initSentry({ enableReplay = false } = {}) {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || initialized) return;

  const enabled =
    import.meta.env.PROD || import.meta.env.VITE_SENTRY_ENABLED === 'true';

  const integrations = [Sentry.browserTracingIntegration()];
  if (enableReplay) {
    integrations.push(
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    );
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    enabled,
    integrations,
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    replaysSessionSampleRate: enableReplay ? 0.05 : 0,
    replaysOnErrorSampleRate: enableReplay ? 1.0 : 0,
    beforeSend(event) {
      if (event.request?.headers?.Authorization) {
        delete event.request.headers.Authorization;
      }
      return event;
    },
  });

  initialized = true;
}

export function setSentryUser(user) {
  if (!initialized) return;

  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.email,
    email: user.email,
    username: user.full_name || user.email,
    subscription_tier: user.subscription_tier,
    role: user.role,
  });
}

export function captureException(error, context) {
  if (!initialized) return;
  Sentry.captureException(error, context);
}

export function captureMessage(message, level = 'info') {
  if (!initialized) return;
  Sentry.captureMessage(message, level);
}

export { Sentry };
