import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { supabaseConfig } from './supabase-env';
import { type Database } from '@/types/database';

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey
  );
}
