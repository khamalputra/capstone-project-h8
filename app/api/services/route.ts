import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getProfile } from '@/lib/auth';
import { serviceFilterSchema, servicePayloadSchema } from '@/lib/validators';

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();
  const url = new URL(request.url);
  const filters = serviceFilterSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!filters.success) {
    return NextResponse.json({ error: filters.error.flatten() }, { status: 400 });
  }

  const { page, ...rest } = filters.data;
  const query = supabase
    .from('services')
    .select('id, title, description, category, price, rating, rating_count, city, provider:profiles(name)', { count: 'exact' })
    .range((page - 1) * 12, page * 12 - 1);

  if (rest.search) query.ilike('title', `%${rest.search}%`);
  if (rest.category) query.eq('category', rest.category);
  if (rest.minPrice) query.gte('price', rest.minPrice);
  if (rest.maxPrice) query.lte('price', rest.maxPrice);
  if (rest.minRating) query.gte('rating', rest.minRating);
  if (rest.city) query.eq('city', rest.city);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ services: data, count });
}

export async function POST(request: Request) {
  const profile = await getProfile();
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'PROVIDER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const payload = servicePayloadSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const { error, data } = await supabase
    .from('services')
    .insert({ ...payload.data, provider_id: profile.id })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ service: data }, { status: 201 });
}
