import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getProfile } from '@/lib/auth';
import { bookingStatusSchema } from '@/lib/validators';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const body = await request.json();
  const parsed = bookingStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  let query = supabase.from('bookings').update({ status: parsed.data.status }).eq('id', params.id);
  if (profile.role === 'USER') {
    query = query.eq('user_id', profile.id);
  } else if (profile.role === 'PROVIDER') {
    query = query.eq('provider_id', profile.id);
  }

  const { data, error } = await query.select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ booking: data });
}
