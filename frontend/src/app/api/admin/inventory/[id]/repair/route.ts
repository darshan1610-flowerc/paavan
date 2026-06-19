import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { handleApiError } from '@/lib/server/errors';
import { createAdminClient } from '@/lib/supabase/admin';
import { notifyTopWaitlist } from '@/lib/server/waitlistRestock';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireAdmin(req);

    const { data: bike, error: fetchError } = await supabase
      .from('bikes')
      .select('available_units, total_units')
      .eq('id', id)
      .single();
    if (fetchError || !bike) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }

    const { count: onRent } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('bike_id', id)
      .eq('status', 'active');

    const inRepair = bike.total_units - bike.available_units - (onRent ?? 0);
    if (inRepair <= 0) {
      return NextResponse.json({ error: 'No units currently in repair' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('bikes')
      .update({ available_units: bike.available_units + 1 })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    await createAdminClient().from('inventory_log').insert({
      bike_id: id,
      action: 'repaired',
      units_changed: 1,
      performed_by: user.id,
    });

    if (bike.available_units === 0) {
      await notifyTopWaitlist(supabase, id, 1);
    }

    return NextResponse.json({ bike: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
