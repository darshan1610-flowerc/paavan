import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Anon-key client for Server Components and Route Handlers — respects RLS.
// Never use this for tables that must stay invisible to RLS-bound clients
// (inventory_log, admin_login_attempts) — use lib/supabase/admin.ts for those.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore,
            // middleware refreshes the session on every request anyway.
          }
        },
      },
    }
  );
}
