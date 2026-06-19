import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateBody } from '@/lib/server/validate';
import { handleApiError } from '@/lib/server/errors';
import { passwordResetRequestSchema } from '@/lib/schemas/admin';
import { generateOTP, hashOTP } from '@/lib/server/otp';
import { sendOTP } from '@/lib/server/notify/whatsapp';

const OTP_VALID_MINUTES = 10;

export async function POST(req: NextRequest) {
  try {
    const { phone } = await validateBody(passwordResetRequestSchema, req);
    const supabase = createAdminClient();

    // Always return the same generic response whether or not this phone
    // belongs to an admin — avoids leaking which numbers are valid admins.
    const { data: profile } = await supabase
      .from('users')
      .select('id, role')
      .eq('phone', phone)
      .maybeSingle();

    if (profile?.role === 'admin') {
      const otp = generateOTP();
      await supabase.from('admin_password_resets').insert({
        phone,
        otp_hash: hashOTP(otp),
        expires_at: new Date(Date.now() + OTP_VALID_MINUTES * 60 * 1000).toISOString(),
      });
      await sendOTP(phone, otp);
    }

    return NextResponse.json({ success: true, message: 'If this phone is registered, an OTP has been sent.' });
  } catch (error) {
    return handleApiError(error);
  }
}
