import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getProfile } from '@/lib/auth';
import { providerApplicationSchema } from '@/lib/validators';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role')
    .eq('role', 'PROVIDER');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ providers: data });
}

export async function POST(request: Request) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const payload = providerApplicationSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      name: payload.data.name,
      phone: payload.data.phone
    })
    .eq('id', profile.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, message: 'Application submitted. Admin will review shortly.' }, { status: 201 });
}
