import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { validateBody } from '@/lib/server/validate';
import { handleApiError } from '@/lib/server/errors';
import { aadhaarRejectSchema } from '@/lib/schemas/admin';
import { sendSMS } from '@/lib/server/notify/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireAdmin(req);
    const { userId, reason } = await validateBody(aadhaarRejectSchema, req);

    const { data: updated, error } = await supabase
      .from('users')
      .update({
        aadhaar_status: 'rejected',
        aadhaar_verified: false,
        aadhaar_rejection_reason: reason,
        aadhaar_reviewed_by: user.id,
      })
      .eq('id', userId)
      .select('id, phone, aadhaar_status')
      .single();

    if (error) throw error;

    await sendSMS(
      updated.phone,
      `Your PAAVAN Aadhaar document was not approved: ${reason}. Please re-upload a clear copy via My Rides.`
    );

    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
