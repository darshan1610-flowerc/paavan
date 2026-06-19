import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { handleApiError } from '@/lib/server/errors';

interface PendingRow {
  id: string;
  booking_ref: string;
  created_at: string;
  user_id: string;
  users: {
    id: string;
    name: string | null;
    phone: string;
    aadhaar_file_path: string | null;
    aadhaar_submitted_at: string | null;
    aadhaar_status: string;
  } | null;
}

export async function GET(req: NextRequest) {
  try {
    const { supabase } = await requireAdmin(req);

    // Aadhaar verification is per-user, not per-booking, but the table
    // wants a booking ref to show — pull each pending user's most recent
    // booking and dedupe by user_id, keeping the latest.
    const { data, error } = await supabase
      .from('bookings')
      .select(
        'id, booking_ref, created_at, user_id, ' +
          'users!inner(id, name, phone, aadhaar_file_path, aadhaar_submitted_at, aadhaar_status)'
      )
      .eq('users.aadhaar_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const seen = new Set<string>();
    const rows: PendingRow[] = [];
    for (const row of (data ?? []) as unknown as PendingRow[]) {
      if (seen.has(row.user_id)) continue;
      seen.add(row.user_id);
      rows.push(row);
    }

    return NextResponse.json({ pending: rows });
  } catch (error) {
    return handleApiError(error);
  }
}
