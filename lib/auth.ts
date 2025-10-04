import { cookies } from 'next/headers';
import { createSupabaseServerClient } from './supabase-server';

export async function getSession() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  return session;
}

export async function getProfile() {
  const supabase = createSupabaseServerClient();
  const session = await getSession();
  if (!session) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  return data;
}

export async function requireRole(required: 'USER' | 'PROVIDER' | 'ADMIN') {
  const profile = await getProfile();
  if (!profile || profile.role !== required) {
    return null;
  }
  return profile;
}

export async function signOutServer() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  cookies().delete('sb-access-token');
  cookies().delete('sb-refresh-token');
}
