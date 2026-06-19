import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { handleApiError } from '@/lib/server/errors';

interface ActiveRideRow {
  id: string;
  booking_ref: string;
  start_date: string;
  end_date: string;
  total_paid: number;
  deposit_amount: number;
  payment_id: string | null;
  users: { name: string | null; phone: string } | null;
  bikes: { id: string; name: string } | null;
  plans: { id: string; name: string; type: string; duration_days: number } | null;
}

export async function GET(req: NextRequest) {
  try {
    const { supabase } = await requireAdmin(req);
    const params = req.nextUrl.searchParams;
    const bikeId = params.get('bikeId');
    const planType = params.get('planType');
    const dateFrom = params.get('dateFrom');
    const dateTo = params.get('dateTo');
    const search = params.get('search')?.trim().toLowerCase();

    let query = supabase
      .from('bookings')
      .select(
        'id, booking_ref, start_date, end_date, total_paid, deposit_amount, payment_id, ' +
          'users(name, phone), bikes!inner(id, name), plans!inner(id, name, type, duration_days)'
      )
      .eq('status', 'active')
      .order('end_date', { ascending: true });

    if (bikeId) query = query.eq('bike_id', bikeId);
    if (planType) query = query.eq('plans.type', planType);
    if (dateFrom) query = query.gte('start_date', dateFrom);
    if (dateTo) query = query.lte('end_date', dateTo);

    const { data, error } = await query;
    if (error) throw error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let rides = ((data ?? []) as unknown as ActiveRideRow[]).map((b) => {
      const endDate = new Date(b.end_date);
      const daysLeft = Math.round((endDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
      return { ...b, daysLeft };
    });

    if (search) {
      rides = rides.filter(
        (r) =>
          r.users?.name?.toLowerCase().includes(search) ||
          r.users?.phone?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ rides });
  } catch (error) {
    return handleApiError(error);
  }
}
