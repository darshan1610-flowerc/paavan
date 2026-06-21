import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminShell from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // The proxy already redirects unauthenticated/non-admin requests away
  // from /admin/*, but /admin/login itself has no layout wrapper (see
  // src/app/admin/login/page.tsx, which renders standalone) so this
  // layout only ever runs for already-verified admin pages. Still,
  // re-check here rather than trusting the proxy alone.
  if (!user) {
    redirect('/admin/login');
  }

  const { data: profile } = await createAdminClient().from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    redirect('/');
  }

  // Extract the real phone from the auth email (format: <phone>@admin.paavan.internal)
  const adminPhone = user.email?.split('@')[0] ?? '';

  const { count } = await supabase
    .from('deposits')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending_review');

  return (
    <AdminShell adminPhone={adminPhone} pendingDepositsCount={count ?? 0}>
      {children}
    </AdminShell>
  );
}
