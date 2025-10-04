import { differenceInMinutes, isBefore } from 'date-fns';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export function hasOverlap(
  newStart: Date,
  newEnd: Date,
  existing: { start: Date; end: Date; status: BookingStatus }[]
) {
  if (isBefore(newEnd, newStart)) {
    throw new Error('End must be after start');
  }
  return existing.some((booking) => {
    if (booking.status !== 'CONFIRMED') return false;
    return newStart < booking.end && newEnd > booking.start;
  });
}

export function canTransition(
  currentStatus: BookingStatus,
  nextStatus: BookingStatus,
  role: 'USER' | 'PROVIDER'
) {
  const transitions: Record<BookingStatus, BookingStatus[]> = {
    PENDING: ['CANCELLED', 'CONFIRMED'],
    CONFIRMED: ['CANCELLED', 'COMPLETED'],
    COMPLETED: [],
    CANCELLED: []
  };
  if (!transitions[currentStatus].includes(nextStatus)) return false;
  if (role === 'USER') {
    return nextStatus === 'CANCELLED' && currentStatus !== 'COMPLETED';
  }
  if (role === 'PROVIDER') {
    if (currentStatus === 'PENDING' && nextStatus === 'CONFIRMED') return true;
    if (nextStatus === 'CANCELLED') return true;
  }
  return false;
}

export function canReview(
  booking: { status: BookingStatus; end_ts: Date; user_id: string },
  reviewerId: string,
  existingReview?: { id: string } | null
) {
  if (existingReview) return false;
  if (booking.user_id !== reviewerId) return false;
  if (booking.status !== 'COMPLETED') return false;
  if (differenceInMinutes(new Date(), booking.end_ts) < 0) return false;
  return true;
}
