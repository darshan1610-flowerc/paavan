import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { handleApiError } from '@/lib/server/errors';
import { createAdminClient } from '@/lib/supabase/admin';

// Moves 1 unit from "in stock" to "in repair" — in_repair is derived
// (total_units - available_units - on_rent), so decrementing
// available_units alone is enough to reflect the move.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireAdmin(req);

    const { data: bike, error: fetchError } = await supabase
      .from('bikes')
      .select('available_units')
      .eq('id', id)
      .single();
    if (fetchError || !bike) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }
    if (bike.available_units <= 0) {
      return NextResponse.json({ error: 'No available units to report as damaged' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('bikes')
      .update({ available_units: bike.available_units - 1 })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    await createAdminClient().from('inventory_log').insert({
      bike_id: id,
      action: 'damaged',
      units_changed: -1,
      performed_by: user.id,
    });

    return NextResponse.json({ bike: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
