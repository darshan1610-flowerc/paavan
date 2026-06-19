import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { validateBody } from '@/lib/server/validate';
import { handleApiError } from '@/lib/server/errors';
import { waitlistNotifySchema } from '@/lib/schemas/admin';
import { sendWhatsApp } from '@/lib/server/notify/whatsapp';

interface WaitlistRow {
  id: string;
  phone: string;
  position: number | null;
  bikes: { name: string } | null;
}

export async function POST(req: NextRequest) {
  try {
    const { supabase } = await requireAdmin(req);
    const { waitlistId } = await validateBody(waitlistNotifySchema, req);

    const { data: fetched, error: fetchError } = await supabase
      .from('waitlist')
      .select('id, phone, position, bikes(name)')
      .eq('id', waitlistId)
      .single();

    if (fetchError || !fetched) {
      return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 });
    }
    const entry = fetched as unknown as WaitlistRow;

    const { data: updated, error } = await supabase
      .from('waitlist')
      .update({ status: 'notified', notified_at: new Date().toISOString() })
      .eq('id', waitlistId)
      .select()
      .single();
    if (error) throw error;

    await sendWhatsApp(
      entry.phone,
      `Great news! ${entry.bikes?.name ?? 'Your bike'} is back in stock. You're #${entry.position ?? '-'} on the waitlist. ` +
        `Your advance deposit of ₹500 will be adjusted against your booking. Book now: paavan.in/bikes`
    );

    return NextResponse.json({ entry: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
