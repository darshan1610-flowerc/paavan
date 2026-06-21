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

  // Role check is handled by the admin layout Server Component,
  // which uses the service-role key and bypasses RLS entirely.
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
