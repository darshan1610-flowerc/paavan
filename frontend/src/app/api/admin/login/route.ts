import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBody } from '@/lib/server/validate';
import { handleApiError, RateLimitError, AdminAuthError } from '@/lib/server/errors';
import { loginSchema } from '@/lib/schemas/admin';
import { phoneToInternalEmail } from '@/lib/server/adminEmail';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getClientIp,
  getRecentFailureCount,
  logLoginAttempt,
  attemptsRemaining,
  isLockedOut,
  LOCKOUT_WINDOW_SECONDS,
} from '@/lib/server/adminLoginAttempts';

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await validateBody(loginSchema, req);
    const ip = getClientIp(req);

    const priorFailures = await getRecentFailureCount(phone);
    if (isLockedOut(priorFailures)) {
      throw new RateLimitError('Too many failed attempts. Try again in 15 minutes.', LOCKOUT_WINDOW_SECONDS);
    }

    const supabase = await createClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: phoneToInternalEmail(phone),
      password,
    });

    if (signInError || !signInData.user) {
      await logLoginAttempt(phone, ip, false);
      const remaining = attemptsRemaining(priorFailures + 1);
      if (remaining === 0) {
        throw new RateLimitError('Too many failed attempts. Try again in 15 minutes.', LOCKOUT_WINDOW_SECONDS);
      }
      return NextResponse.json(
        { error: 'Invalid credentials', attemptsRemaining: remaining },
        { status: 401 }
      );
    }

    // Use the service-role client for this one check, not the
    // session-bound client above — querying your own row via RLS works
    // for ordinary subsequent requests (once the session cookie has
    // round-tripped through the browser), but immediately after
    // signInWithPassword, in the very same request, the fresh JWT can
    // race with this follow-up query and RLS sees no session yet,
    // silently returning zero rows. The service-role client bypasses
    // RLS entirely, which is safe here since we've already verified the
    // password.
    const { data: profile, error: profileError } = await createAdminClient()
      .from('users')
      .select('role')
      .eq('id', signInData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('[admin/login] profile lookup failed for user id', signInData.user.id, profileError);
      await supabase.auth.signOut();
      await logLoginAttempt(phone, ip, false);
      throw new AdminAuthError(
        `Profile lookup errored (not just empty): ${profileError.message} (code: ${profileError.code ?? 'n/a'})`,
        403
      );
    }

    if (!profile) {
      await supabase.auth.signOut();
      await logLoginAttempt(phone, ip, false);
      throw new AdminAuthError(
        `No profile row found in public.users for auth id ${signInData.user.id}. Check that your SQL update matched this exact id.`,
        403
      );
    }

    if (profile.role !== 'admin') {
      await supabase.auth.signOut();
      await logLoginAttempt(phone, ip, false);
      throw new AdminAuthError(`Profile found but role is '${profile.role}', not 'admin'.`, 403);
    }

    await logLoginAttempt(phone, ip, true);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
