import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  STRIPE_API_VERSION,
  subscriptionIdFromInvoice,
  subscriptionPeriodBounds
} from './billing.js';

test('stripe client is pinned to the stripe-node 23 API version', () => {
  assert.equal(STRIPE_API_VERSION, '2026-09-30.endive');
});

test('checkout does not send payment_method_types removed in 2026-09-30.endive', () => {
  const source = readFileSync(new URL('../billing/checkout.js', import.meta.url), 'utf8');
  assert.equal(source.includes('payment_method_types'), false);
  assert.equal(source.includes('allowed_payment_method_types'), false);
});

test('invoice subscription id follows the endive parent shape and older payloads', () => {
  assert.equal(subscriptionIdFromInvoice(null), '');
  assert.equal(subscriptionIdFromInvoice({
    parent: {
      subscription_details: { subscription: 'sub_parent' }
    },
    subscription: 'sub_legacy'
  }), 'sub_parent');
  assert.equal(subscriptionIdFromInvoice({
    parent: {
      subscription_details: { subscription: { id: 'sub_expanded' } }
    }
  }), 'sub_expanded');
  assert.equal(subscriptionIdFromInvoice({
    lines: {
      data: [
        { parent: { subscription_item_details: { subscription: 'sub_line' } } }
      ]
    }
  }), 'sub_line');
  assert.equal(subscriptionIdFromInvoice({ subscription: 'sub_legacy' }), 'sub_legacy');
  assert.equal(subscriptionIdFromInvoice({ subscription: { id: 'sub_object' } }), 'sub_object');
});

test('membership periods come from the subscription item when both shapes are present', () => {
  const bounds = subscriptionPeriodBounds({
    current_period_start: 1_700_000_000,
    current_period_end: 1_700_000_100,
    items: {
      data: [{
        current_period_start: 1_735_689_600,
        current_period_end: 1_738_368_000
      }]
    }
  });
  assert.equal(bounds.currentPeriodStart, '2025-01-01T00:00:00.000Z');
  assert.equal(bounds.currentPeriodEnd, '2025-02-01T00:00:00.000Z');
  assert.deepEqual(subscriptionPeriodBounds({
    current_period_start: 1_735_689_600,
    current_period_end: 1_738_368_000
  }), bounds);
});
