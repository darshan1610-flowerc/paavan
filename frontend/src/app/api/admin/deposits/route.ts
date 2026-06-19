import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { handleApiError } from '@/lib/server/errors';

const VALID_STATUSES = ['pending_review', 'approved', 'withheld', 'held'];

export async function GET(req: NextRequest) {
  try {
    const { supabase } = await requireAdmin(req);
    const status = req.nextUrl.searchParams.get('status') ?? 'pending_review';
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('deposits')
      .select(
        'id, amount, status, return_video_path, submitted_at, window_closes_at, reviewed_at, notes, ' +
          'booking_id, user_id, bookings(booking_ref), users(name, phone, aadhaar_status)'
      )
      .eq('status', status)
      .order('window_closes_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ deposits: data ?? [] });
  } catch (error) {
    return handleApiError(error);
  }
}
