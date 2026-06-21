import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { handleApiError } from '@/lib/server/errors';

export async function GET(req: NextRequest) {
  try {
    const { supabase } = await requireAdmin(req);

    // Clean up ghost bookings (pending > 30 min with no payment)
    await supabase.rpc('cancel_stale_pending_bookings');

    const [bikesRes, activeBookingsRes, pendingAadhaarRes, pendingDepositsRes, closingDepositsRes, recentBookingsRes] =
      await Promise.all([
        supabase.from('bikes').select('total_units, available_units, is_active'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('aadhaar_status', 'pending').not('aadhaar_file_path', 'is', null),
        supabase.from('deposits').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase
          .from('deposits')
          .select('id, booking_id, window_closes_at, bookings(booking_ref)')
          .eq('status', 'pending_review')
          .lte('window_closes_at', new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString())
          .order('window_closes_at', { ascending: true }),
        supabase
          .from('bookings')
          .select('id, booking_ref, status, total_paid, created_at, users(name, phone), bikes(name)')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

    const bikes = bikesRes.data ?? [];
    const totalBikes = bikes.reduce((sum, b) => sum + b.total_units, 0);
    const availableNow = bikes.reduce((sum, b) => sum + b.available_units, 0);
    const inRepair = bikes.reduce((sum, b) => sum + Math.max(0, b.total_units - b.available_units), 0) -
      (activeBookingsRes.count ?? 0);

    const { data: monthRevenue } = await supabase
      .from('bookings')
      .select('total_paid')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    const monthlyRevenue = (monthRevenue ?? []).reduce((sum, b) => sum + (b.total_paid ?? 0), 0);

    return NextResponse.json({
      stats: {
        totalBikes,
        currentlyRented: activeBookingsRes.count ?? 0,
        availableNow,
        inRepair: Math.max(0, inRepair),
        pendingDeposits: pendingDepositsRes.count ?? 0,
        monthlyRevenue,
      },
      needsAttention: {
        pendingAadhaar: pendingAadhaarRes.count ?? 0,
        closingDeposits: closingDepositsRes.data ?? [],
      },
      recentBookings: recentBookingsRes.data ?? [],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
