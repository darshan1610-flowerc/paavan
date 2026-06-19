import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateBody } from '@/lib/server/validate';
import { handleApiError, AdminAuthError } from '@/lib/server/errors';
import { passwordResetConfirmSchema } from '@/lib/schemas/admin';
import { hashOTP } from '@/lib/server/otp';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, newPassword } = await validateBody(passwordResetConfirmSchema, req);
    const supabase = createAdminClient();

    const { data: resetRow } = await supabase
      .from('admin_password_resets')
      .select('id, expires_at, used')
      .eq('phone', phone)
      .eq('otp_hash', hashOTP(otp))
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!resetRow || resetRow.used || new Date(resetRow.expires_at) < new Date()) {
      throw new AdminAuthError('Invalid or expired OTP', 401);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id, role')
      .eq('phone', phone)
      .single();

    if (profile?.role !== 'admin') {
      throw new AdminAuthError('Not authorized', 403);
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
      password: newPassword,
    });
    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }

    await supabase.from('admin_password_resets').update({ used: true }).eq('id', resetRow.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
