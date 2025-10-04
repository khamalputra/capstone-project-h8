import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getProfile, getSession } from '@/lib/auth';
import { bookingCreateSchema } from '@/lib/validators';

export async function GET(request: Request) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from('bookings')
    .select('id, start_ts, end_ts, status, notes, services(title), user:profiles(name), provider:profiles(name))')
    .order('start_ts', { ascending: false });
  if (profile.role === 'USER') {
    query = query.eq('user_id', profile.id);
  } else if (profile.role === 'PROVIDER') {
    query = query.eq('provider_id', profile.id);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ bookings: data });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const payload = bookingCreateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('provider_id', payload.data.provider_id)
    .lte('start_ts', payload.data.start_ts.toISOString())
    .gte('end_ts', payload.data.end_ts.toISOString())
    .maybeSingle();

  if (!availability) {
    return NextResponse.json({ error: 'Slot not available' }, { status: 409 });
  }

  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('provider_id', payload.data.provider_id)
    .eq('status', 'CONFIRMED')
    .or(`and(start_ts.lte.${payload.data.end_ts.toISOString()},end_ts.gte.${payload.data.start_ts.toISOString()})`);

  if (conflicts && conflicts.length) {
    return NextResponse.json({ error: 'Slot conflicts with existing booking' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: session.user.id,
      provider_id: payload.data.provider_id,
      service_id: payload.data.service_id,
      start_ts: payload.data.start_ts.toISOString(),
      end_ts: payload.data.end_ts.toISOString(),
      notes: payload.data.notes ?? null
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ booking: data }, { status: 201 });
}
