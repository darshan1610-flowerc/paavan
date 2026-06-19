import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { handleApiError } from '@/lib/server/errors';

const MONTHS_BACK = 6;

interface BookingRow {
  bike_id: string;
  rental_amount: number;
  platform_fee: number;
  created_at: string;
  plans: { type: string } | null;
}

interface DepositRow {
  amount: number;
  status: string;
  created_at: string;
  reviewed_at: string | null;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function GET(req: NextRequest) {
  try {
    const { supabase } = await requireAdmin(req);

    const since = new Date();
    since.setMonth(since.getMonth() - (MONTHS_BACK - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const [{ data: bookingsRaw, error: bookingsError }, { data: depositsRaw, error: depositsError }] = await Promise.all([
      supabase
        .from('bookings')
        .select('bike_id, rental_amount, platform_fee, created_at, plans(type)')
        .gte('created_at', since.toISOString()),
      supabase
        .from('deposits')
        .select('amount, status, created_at, reviewed_at')
        .gte('created_at', since.toISOString()),
    ]);

    if (bookingsError) throw bookingsError;
    if (depositsError) throw depositsError;

    const bookings = (bookingsRaw ?? []) as unknown as BookingRow[];
    const deposits = (depositsRaw ?? []) as unknown as DepositRow[];

    const months: string[] = [];
    for (let i = 0; i < MONTHS_BACK; i++) {
      const d = new Date(since);
      d.setMonth(d.getMonth() + i);
      months.push(monthKey(d));
    }

    const monthly = months.map((key) => {
      const monthBookings = bookings.filter((b) => monthKey(new Date(b.created_at)) === key);
      const students = monthBookings
        .filter((b) => b.plans?.type === 'student')
        .reduce((s, b) => s + b.rental_amount + b.platform_fee, 0);
      const delivery = monthBookings
        .filter((b) => b.plans?.type === 'delivery')
        .reduce((s, b) => s + b.rental_amount + b.platform_fee, 0);
      const totalRental = students + delivery;

      const depositsCollected = deposits
        .filter((d) => monthKey(new Date(d.created_at)) === key)
        .reduce((s, d) => s + d.amount, 0);
      const depositsRefunded = deposits
        .filter((d) => d.status === 'approved' && d.reviewed_at && monthKey(new Date(d.reviewed_at)) === key)
        .reduce((s, d) => s + d.amount, 0);
      const depositsWithheld = deposits
        .filter((d) => d.status === 'withheld' && d.reviewed_at && monthKey(new Date(d.reviewed_at)) === key)
        .reduce((s, d) => s + d.amount, 0);

      const bikesUtilised = new Set(monthBookings.map((b) => b.bike_id)).size;
      const netRevenue = totalRental + depositsWithheld;

      return {
        month: key,
        students,
        delivery,
        totalRental,
        depositsCollected,
        depositsRefunded,
        depositsWithheld,
        netRevenue,
        bikesUtilised,
      };
    });

    const current = monthly[monthly.length - 1];

    return NextResponse.json({ monthly, summary: current });
  } catch (error) {
    return handleApiError(error);
  }
}
