import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // No Supabase project wired up yet (env vars unset) — fail closed with a
  // clear message instead of crashing inside createServerClient with a
  // raw stack trace, on every single /admin/* request including login.
  if (!isSupabaseConfigured()) {
    return new NextResponse('Admin portal is not yet configured: Supabase env vars are missing.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const { supabase, response } = updateSession(request);

  if (pathname === '/admin/login') {
    return response;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('[proxy] profile lookup failed for user id', user.id, profileError);
  }

  if (profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
