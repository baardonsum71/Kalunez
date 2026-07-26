import { describe, it, expect } from 'vitest';
import {
  SUBSCRIPTION_PLANS,
  getConfiguredPlans,
  getPlanById,
  formatCents,
  TIP_AMOUNTS,
  tipProductId,
  TICKET_PRICES,
  getTicketPriceById,
  formatTicketPrice,
  nearestTicketTier,
} from './revenuecat';

describe('revenuecat config', () => {
  it('defines all expected subscription plans', () => {
    const ids = SUBSCRIPTION_PLANS.map(p => p.id);
    expect(ids).toContain('pro_monthly_subscription');
    expect(ids).toContain('premium_monthly_subscription');
    expect(ids).toContain('premium_podcast_yearly');
    expect(SUBSCRIPTION_PLANS).toHaveLength(5);
  });

  it('getConfiguredPlans always returns display plans', () => {
    const configured = getConfiguredPlans();
    expect(configured).toHaveLength(SUBSCRIPTION_PLANS.length);
  });

  it('getPlanById returns matching plan', () => {
    const sample = SUBSCRIPTION_PLANS[0];
    expect(getPlanById(sample.id)?.id).toBe(sample.id);
    expect(getPlanById('nonexistent')).toBeUndefined();
  });

  it('formatCents formats USD currency', () => {
    expect(formatCents(999)).toBe('$9.99');
    expect(formatCents(0)).toBe('$0.00');
  });

  it('TIP_AMOUNTS includes expected values', () => {
    expect(TIP_AMOUNTS).toEqual([1, 5, 10, 20, 50, 100]);
    expect(tipProductId(1)).toBe('kalunez_tip_1');
    expect(tipProductId(100)).toBe('kalunez_tip_100');
  });

  it('TICKET_PRICES defines the five fixed ticket tiers', () => {
    expect(TICKET_PRICES.map((t) => t.id)).toEqual([
      'event_ticket_49',
      'event_ticket_99',
      'event_ticket_149',
      'event_ticket_199',
      'event_ticket_299',
    ]);
    expect(getTicketPriceById('event_ticket_99')?.price_cents).toBe(9900);
    expect(formatTicketPrice(4900)).toBe('49 kr');
    expect(nearestTicketTier(10000)?.id).toBe('event_ticket_99');
  });
});
