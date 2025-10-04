import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getProfile } from '@/lib/auth';
import { servicePayloadSchema } from '@/lib/validators';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const profile = await getProfile();
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'PROVIDER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const payload = servicePayloadSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('services')
    .update(payload.data)
    .eq('id', params.id)
    .eq('provider_id', profile.id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ service: data });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const profile = await getProfile();
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'PROVIDER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('services').delete().eq('id', params.id).eq('provider_id', profile.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
