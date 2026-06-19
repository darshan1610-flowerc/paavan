import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Service-role client — bypasses RLS entirely. Server-only: never import
// this from a 'use client' component or any module reachable from one.
// Used for: signed URL generation, and writes to tables with no
// client-facing RLS policy at all (inventory_log, admin_login_attempts).
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient must never be called from the browser');
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
