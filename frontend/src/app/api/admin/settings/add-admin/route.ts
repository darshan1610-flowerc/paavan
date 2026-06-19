import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { validateBody } from '@/lib/server/validate';
import { handleApiError } from '@/lib/server/errors';
import { addAdminSchema } from '@/lib/schemas/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { phoneToInternalEmail } from '@/lib/server/adminEmail';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { phone, tempPassword } = await validateBody(addAdminSchema, req);
    const supabase = createAdminClient();

    const { data: created, error } = await supabase.auth.admin.createUser({
      email: phoneToInternalEmail(phone),
      password: tempPassword,
      email_confirm: true,
    });
    if (error || !created.user) {
      return NextResponse.json({ error: error?.message ?? 'Failed to create admin user' }, { status: 400 });
    }

    // The on_auth_user_created trigger inserts a public.users row using
    // auth.users.phone, which is null for an email-created identity — fix
    // up the real phone number here and promote the row to admin.
    const { error: roleError } = await supabase
      .from('users')
      .update({ role: 'admin', phone })
      .eq('id', created.user.id);
    if (roleError) throw roleError;

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
