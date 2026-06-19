import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { handleApiError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const { supabase } = await requireAdmin(req);
    const params = req.nextUrl.searchParams;
    const bikeId = params.get('bikeId');
    const status = params.get('status'); // 'completed' | 'cancelled'
    const month = params.get('month'); // 'YYYY-MM'

    let query = supabase
      .from('bookings')
      .select(
        'id, booking_ref, start_date, end_date, total_paid, deposit_amount, status, created_at, ' +
          'user_id, users(name, phone), bikes(name), plans(name, duration_days), ' +
          'deposits(status)'
      )
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false });

    if (bikeId) query = query.eq('bike_id', bikeId);
    if (status) query = query.eq('status', status);
    if (month) {
      const [year, m] = month.split('-').map(Number);
      const from = new Date(year, m - 1, 1).toISOString();
      const to = new Date(year, m, 1).toISOString();
      query = query.gte('created_at', from).lt('created_at', to);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ bookings: data ?? [] });
  } catch (error) {
    return handleApiError(error);
  }
}
