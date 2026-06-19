import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { validateBody } from '@/lib/server/validate';
import { handleApiError } from '@/lib/server/errors';
import { inventoryUpdateSchema } from '@/lib/schemas/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { notifyTopWaitlist } from '@/lib/server/waitlistRestock';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireAdmin(req);
    const body = await validateBody(inventoryUpdateSchema, req);

    const { data: existing, error: fetchError } = await supabase
      .from('bikes')
      .select('available_units, total_units')
      .eq('id', id)
      .single();
    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }

    const update: Record<string, unknown> = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.description !== undefined) update.description = body.description;
    if (body.specs !== undefined) update.specs = body.specs;
    if (body.pricePerDay !== undefined) update.price_per_day = body.pricePerDay;
    if (body.pricePerWeek !== undefined) update.price_per_week = body.pricePerWeek;
    if (body.pricePerMonth !== undefined) update.price_per_month = body.pricePerMonth;
    if (body.totalUnits !== undefined) update.total_units = body.totalUnits;
    if (body.availableUnits !== undefined) update.available_units = body.availableUnits;
    if (body.isActive !== undefined) update.is_active = body.isActive;
    if (body.imagePath !== undefined) update.image_path = body.imagePath;

    const { data: bike, error } = await supabase.from('bikes').update(update).eq('id', id).select().single();
    if (error) throw error;

    if (body.availableUnits !== undefined && body.availableUnits !== existing.available_units) {
      await createAdminClient().from('inventory_log').insert({
        bike_id: id,
        action: 'stock_update',
        units_changed: body.availableUnits - existing.available_units,
        performed_by: user.id,
        notes: 'Manual stock edit',
      });

      if (existing.available_units === 0 && body.availableUnits > 0) {
        await notifyTopWaitlist(supabase, id, body.availableUnits);
      }
    }

    return NextResponse.json({ bike });
  } catch (error) {
    return handleApiError(error);
  }
}
