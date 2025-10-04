import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getProfile } from '@/lib/auth';
import { availabilitySchema } from '@/lib/validators';

export async function GET() {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const supabase = createSupabaseServerClient();
  const query = supabase
    .from('availability')
    .select('id, provider_id, start_ts, end_ts')
    .order('start_ts', { ascending: true });
  if (profile.role === 'PROVIDER') {
    query.eq('provider_id', profile.id);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ availability: data });
}

export async function POST(request: Request) {
  const profile = await getProfile();
  if (!profile || profile.role !== 'PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const payload = availabilitySchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('availability')
    .insert({
      provider_id: profile.id,
      start_ts: payload.data.start_ts.toISOString(),
      end_ts: payload.data.end_ts.toISOString()
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ slot: data }, { status: 201 });
}
