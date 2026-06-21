import { describe, it, expect } from 'vitest';
import { isSentryEnabled, initSentry } from './sentry';

describe('sentry', () => {
  it('is disabled without DSN', () => {
    initSentry();
    expect(isSentryEnabled()).toBe(false);
  });

  it('captureException is safe when not initialized', async () => {
    const { captureException } = await import('./sentry');
    expect(() => captureException(new Error('test'))).not.toThrow();
  });
});
