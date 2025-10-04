import { describe, expect, it, vi } from 'vitest';
import { addHours, subHours } from 'date-fns';
import { canReview, canTransition, hasOverlap } from '@/lib/booking';

describe('booking overlap', () => {
  it('detects conflict with confirmed booking', () => {
    const now = new Date();
    const conflict = hasOverlap(now, addHours(now, 2), [
      { start: subHours(now, 1), end: addHours(now, 1), status: 'CONFIRMED' }
    ]);
    expect(conflict).toBe(true);
  });

  it('allows slot when only pending bookings exist', () => {
    const now = new Date();
    const conflict = hasOverlap(now, addHours(now, 2), [
      { start: subHours(now, 1), end: addHours(now, 1), status: 'PENDING' }
    ]);
    expect(conflict).toBe(false);
  });
});

describe('booking transitions', () => {
  it('allows provider to confirm pending booking', () => {
    expect(canTransition('PENDING', 'CONFIRMED', 'PROVIDER')).toBe(true);
  });

  it('prevents user from confirming booking', () => {
    expect(canTransition('PENDING', 'CONFIRMED', 'USER')).toBe(false);
  });

  it('allows user to cancel before completion', () => {
    expect(canTransition('CONFIRMED', 'CANCELLED', 'USER')).toBe(true);
  });
});

describe('review permission', () => {
  it('only allows after completion and no prior review', () => {
    const booking = { status: 'COMPLETED' as const, end_ts: subHours(new Date(), 1), user_id: 'user-1' };
    expect(canReview(booking, 'user-1', null)).toBe(true);
    expect(canReview({ ...booking, status: 'CONFIRMED' }, 'user-1', null)).toBe(false);
    expect(canReview(booking, 'user-2', null)).toBe(false);
    expect(canReview(booking, 'user-1', { id: 'review' })).toBe(false);
  });
});
