import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { validateBody } from '@/lib/server/validate';
import { handleApiError } from '@/lib/server/errors';
import { aadhaarVerifySchema } from '@/lib/schemas/admin';

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireAdmin(req);
    const { userId } = await validateBody(aadhaarVerifySchema, req);

    const { data: updated, error } = await supabase
      .from('users')
      .update({
        aadhaar_status: 'verified',
        aadhaar_verified: true,
        aadhaar_verified_at: new Date().toISOString(),
        aadhaar_reviewed_by: user.id,
      })
      .eq('id', userId)
      .select('id, aadhaar_status')
      .single();

    if (error) throw error;
    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
