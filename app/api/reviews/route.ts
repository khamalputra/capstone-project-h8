import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { reviewSchema } from '@/lib/validators';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const payload = reviewSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, end_ts')
    .eq('id', payload.data.booking_id)
    .eq('user_id', session.user.id)
    .single();

  if (!booking || booking.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Review allowed only after completed booking' }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', payload.data.booking_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Review already submitted' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      booking_id: payload.data.booking_id,
      service_id: payload.data.service_id,
      user_id: session.user.id,
      rating: payload.data.rating,
      comment: payload.data.comment ?? null
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.rpc('increment_service_rating', {
    service_id: payload.data.service_id,
    new_rating: payload.data.rating
  });

  return NextResponse.json({ review: data }, { status: 201 });
}
