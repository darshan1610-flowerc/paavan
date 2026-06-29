import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { validateBody } from '@/lib/server/validate';
import { handleApiError } from '@/lib/server/errors';
import { inventoryCreateSchema } from '@/lib/schemas/admin';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { supabase } = await requireAdmin(req);

    const [{ data: bikes, error: bikesError }, { data: activeBookings }] = await Promise.all([
      supabase.from('bikes').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('bike_id').eq('status', 'active'),
    ]);

    if (bikesError) throw bikesError;

    const onRentByBike = new Map<string, number>();
    for (const b of activeBookings ?? []) {
      onRentByBike.set(b.bike_id, (onRentByBike.get(b.bike_id) ?? 0) + 1);
    }

    const rows = (bikes ?? []).map((bike) => {
      const onRent = onRentByBike.get(bike.id) ?? 0;
      const inRepair = Math.max(0, bike.total_units - bike.available_units - onRent);
      return { ...bike, on_rent: onRent, in_repair: inRepair };
    });

    return NextResponse.json({ bikes: rows });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireAdmin(req);
    const body = await validateBody(inventoryCreateSchema, req);

    const { data: bike, error } = await supabase
      .from('bikes')
      .insert({
        name: body.name,
        description: body.description ?? null,
        specs: body.specs,
        price_per_day: body.pricePerDay,
        price_per_week: body.pricePerWeek,
        price_per_month: body.pricePerMonth,
        total_units: body.totalUnits,
        available_units: body.totalUnits,
        image_path: body.imagePath ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // inventory_log has no client-facing RLS policy at all — only the
    // service-role client can write to it.
    await createAdminClient().from('inventory_log').insert({
      bike_id: bike.id,
      action: 'added',
      units_changed: body.totalUnits,
      performed_by: user.id,
      notes: `Added new bike model "${body.name}"`,
    });

    return NextResponse.json({ bike }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
