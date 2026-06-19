import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { handleApiError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const { supabase } = await requireAdmin(req);
    const bikeId = req.nextUrl.searchParams.get('bikeId');

    let query = supabase
      .from('waitlist')
      .select('id, position, advance_deposit, status, notified_at, created_at, phone, bike_id, users(name), bikes(name)')
      .order('bike_id', { ascending: true })
      .order('position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (bikeId) query = query.eq('bike_id', bikeId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ waitlist: data ?? [] });
  } catch (error) {
    return handleApiError(error);
  }
}
