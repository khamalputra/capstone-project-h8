import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { type CookieOptions } from '@supabase/auth-helpers-shared';
import { supabaseConfig } from './supabase-env';
import { type Database } from '@/types/database';

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        }
      }
    }
  );
}
