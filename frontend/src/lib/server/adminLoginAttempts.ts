import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const LOCKOUT_WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 5;

export function getClientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

// admin_login_attempts has no client-facing RLS policy at all, so every
// read/write here goes through the service-role client.
export async function getRecentFailureCount(phone: string) {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count } = await supabase
    .from('admin_login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('phone', phone)
    .eq('success', false)
    .gte('attempted_at', since);

  return count ?? 0;
}

export async function logLoginAttempt(phone: string, ipAddress: string, success: boolean) {
  const supabase = createAdminClient();
  await supabase.from('admin_login_attempts').insert({ phone, ip_address: ipAddress, success });
}

export function attemptsRemaining(failureCount: number) {
  return Math.max(0, MAX_ATTEMPTS - failureCount);
}

export function isLockedOut(failureCount: number) {
  return failureCount >= MAX_ATTEMPTS;
}

export const LOCKOUT_WINDOW_SECONDS = LOCKOUT_WINDOW_MINUTES * 60;
