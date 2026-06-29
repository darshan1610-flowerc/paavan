import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { handleApiError } from '@/lib/server/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bikeId = body?.bikeId;
    if (!bikeId || typeof bikeId !== 'string') {
      return NextResponse.json({ error: 'bikeId required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: bike, error: fetchError } = await supabase
      .from('bikes')
      .select('available_units, is_active')
      .eq('id', bikeId)
      .single();

    if (fetchError || !bike) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }
    if (!bike.is_active || bike.available_units <= 0) {
      return NextResponse.json({ error: 'This bike is currently out of stock' }, { status: 409 });
    }

    // Decrement — .gt guard prevents going negative if two requests race
    const { error: updateError } = await supabase
      .from('bikes')
      .update({ available_units: bike.available_units - 1 })
      .eq('id', bikeId)
      .gt('available_units', 0);

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
