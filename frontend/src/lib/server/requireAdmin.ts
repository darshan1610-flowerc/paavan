import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminAuthError } from '@/lib/server/errors';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// The actual security boundary for every /api/admin/* route. Middleware
// only redirects for UX — this re-checks auth + role server-side on
// every single request, because middleware can be bypassed by hitting
// an API route directly.
export async function requireAdmin(req: NextRequest) {
  if (MUTATING_METHODS.has(req.method)) {
    assertSameOrigin(req);
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AdminAuthError('Not authenticated', 401);
  }

  const { data: profile, error: profileError } = await createAdminClient()
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    throw new AdminAuthError('Not authorized', 403);
  }

  // Return the service-role client for DB operations in admin routes.
  // requireAdmin already verified the user is authenticated and has the admin
  // role, so bypassing RLS here is safe and avoids is_admin() policy failures.
  return { user, supabase: createAdminClient() };
}

// CSRF defense-in-depth: same-site session cookies already cover most of
// this, but explicitly rejecting cross-origin mutating requests means a
// malicious page on another origin can't even attempt the request.
function assertSameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin) return; // same-origin requests from same-site navigations may omit Origin

  const host = req.headers.get('host');
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AdminAuthError('Invalid origin', 403);
  }

  if (originHost !== host) {
    throw new AdminAuthError('Cross-origin request rejected', 403);
  }
}
