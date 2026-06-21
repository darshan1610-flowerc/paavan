import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { phone, bikeId } = await req.json();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Valid 10-digit phone number is required' }, { status: 400 });
    }
    if (!bikeId) {
      return NextResponse.json({ error: 'Bike ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify bike exists and is out of stock
    const { data: bike } = await supabase
      .from('bikes')
      .select('id, name, available_units, is_active')
      .eq('id', bikeId)
      .single();

    if (!bike) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }
    if (bike.available_units > 0) {
      return NextResponse.json({ error: 'This bike is currently in stock — book it directly' }, { status: 400 });
    }

    // Prevent duplicate entries
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id, status')
      .eq('bike_id', bikeId)
      .eq('phone', phone)
      .in('status', ['waiting', 'notified'])
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'You are already on the waitlist for this bike' }, { status: 409 });
    }

    // Get next position
    const { count } = await supabase
      .from('waitlist')
      .select('id', { count: 'exact', head: true })
      .eq('bike_id', bikeId)
      .in('status', ['waiting', 'notified']);

    const position = (count ?? 0) + 1;

    // Look up user if they exist
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .or(`phone.eq.${phone},phone.eq.91${phone}`)
      .maybeSingle();

    const { data: entry, error } = await supabase
      .from('waitlist')
      .insert({
        bike_id: bikeId,
        user_id: user?.id ?? null,
        phone,
        position,
        status: 'waiting',
        advance_deposit: 500,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, position, entry });
  } catch (error: any) {
    console.error('[waitlist/join]', error);
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
  }
}
