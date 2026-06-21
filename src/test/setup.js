import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      AnalyticsEvent: { create: vi.fn().mockResolvedValue({}) },
    },
    functions: { invoke: vi.fn() },
    auth: {
      me: vi.fn(),
      redirectToLogin: vi.fn(),
    },
  },
}));

vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    identify: vi.fn(),
    capture: vi.fn(),
    reset: vi.fn(),
  },
}));

vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  setUser: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  browserTracingIntegration: vi.fn(),
  replayIntegration: vi.fn(),
}));
