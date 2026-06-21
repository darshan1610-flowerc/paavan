import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { validateBody } from '@/lib/server/validate';
import { handleApiError, AdminAuthError } from '@/lib/server/errors';
import { changePasswordSchema } from '@/lib/schemas/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { phoneToInternalEmail } from '@/lib/server/adminEmail';

export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await requireAdmin(req);
    const { currentPassword, newPassword } = await validateBody(changePasswordSchema, req);

    if (!user.email) {
      throw new AdminAuthError('Account not found', 403);
    }

    // Verify the current password before allowing a change — a valid
    // session alone isn't enough proof, in case it was left open on a
    // shared machine.
    const verifyClient = createAdminClient();
    const { error: verifyError } = await verifyClient.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) {
      throw new AdminAuthError('Current password is incorrect', 401);
    }

    const { error } = await verifyClient.auth.admin.updateUserById(user.id, { password: newPassword });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
