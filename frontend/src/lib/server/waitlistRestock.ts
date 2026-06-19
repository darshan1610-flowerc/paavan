import { SupabaseClient } from '@supabase/supabase-js';
import { sendWhatsApp } from '@/lib/server/notify/whatsapp';

// Called whenever a bike's available_units moves from 0 to something
// positive (inventory edit-stock or mark-repaired). Notifies the top N
// waiting users (N = units becoming available), in queue order, and
// flips them to 'notified'. Converting to 'converted' on actual booking,
// or rolling over to the next person after 48h with no booking, depends
// on a real booking-creation API and a scheduled job respectively —
// neither exists yet, so those transitions stay manual (admin can use
// the "manually notify" / "process refund" actions) until that's built.
export async function notifyTopWaitlist(supabase: SupabaseClient, bikeId: string, unitsAvailable: number) {
  if (unitsAvailable <= 0) return;

  const { data: waiting } = await supabase
    .from('waitlist')
    .select('id, phone, position')
    .eq('bike_id', bikeId)
    .eq('status', 'waiting')
    .order('position', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .limit(unitsAvailable);

  const { data: bike } = await supabase.from('bikes').select('name').eq('id', bikeId).single();

  for (const entry of waiting ?? []) {
    await supabase
      .from('waitlist')
      .update({ status: 'notified', notified_at: new Date().toISOString() })
      .eq('id', entry.id);

    await sendWhatsApp(
      entry.phone,
      `Great news! ${bike?.name ?? 'Your bike'} is back in stock. You're #${entry.position ?? '-'} on the waitlist. ` +
        `Your advance deposit of ₹500 will be adjusted against your booking. Book now: paavan.in/bikes`
    );
  }
}
