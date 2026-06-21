import { describe, it, expect } from 'vitest';
import {
  SUBSCRIPTION_PLANS,
  getConfiguredPlans,
  getPlanByPriceId,
  formatCents,
  TIP_AMOUNTS,
} from './stripe';

describe('stripe config', () => {
  it('defines all expected subscription plans', () => {
    const ids = SUBSCRIPTION_PLANS.map(p => p.id);
    expect(ids).toContain('pro_monthly');
    expect(ids).toContain('premium_monthly');
    expect(ids).toContain('premium_podcast_yearly');
    expect(SUBSCRIPTION_PLANS).toHaveLength(5);
  });

  it('getConfiguredPlans filters plans without priceId', () => {
    const configured = getConfiguredPlans();
    configured.forEach(plan => {
      expect(plan.priceId).toBeTruthy();
    });
  });

  it('getPlanByPriceId returns matching plan', () => {
    const sample = SUBSCRIPTION_PLANS[0];
    if (sample.priceId) {
      expect(getPlanByPriceId(sample.priceId)?.id).toBe(sample.id);
    } else {
      expect(getPlanByPriceId('nonexistent')).toBeUndefined();
    }
  });

  it('formatCents formats USD currency', () => {
    expect(formatCents(999)).toBe('$9.99');
    expect(formatCents(0)).toBe('$0.00');
  });

  it('TIP_AMOUNTS includes expected values', () => {
    expect(TIP_AMOUNTS).toEqual([1, 5, 10, 20, 50, 100]);
  });
});
