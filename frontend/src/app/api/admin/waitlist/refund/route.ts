import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { validateBody } from '@/lib/server/validate';
import { handleApiError } from '@/lib/server/errors';
import { waitlistRefundSchema } from '@/lib/schemas/admin';
import { refundDeposit } from '@/lib/server/payments/razorpay';
import { sendWhatsApp } from '@/lib/server/notify/whatsapp';

interface WaitlistRow {
  id: string;
  phone: string;
  advance_deposit: number;
  payment_id: string | null;
  status: string;
}

export async function POST(req: NextRequest) {
  try {
    const { supabase } = await requireAdmin(req);
    const { waitlistId } = await validateBody(waitlistRefundSchema, req);

    const { data: fetched, error: fetchError } = await supabase
      .from('waitlist')
      .select('id, phone, advance_deposit, payment_id, status')
      .eq('id', waitlistId)
      .single();

    if (fetchError || !fetched) {
      return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 });
    }
    const entry = fetched as unknown as WaitlistRow;

    if (entry.status === 'converted' || entry.status === 'refunded') {
      return NextResponse.json({ error: `Cannot refund a ${entry.status} entry` }, { status: 400 });
    }
    if (!entry.payment_id) {
      return NextResponse.json({ error: 'No advance payment on file to refund' }, { status: 400 });
    }

    const refund = await refundDeposit(entry.payment_id, entry.advance_deposit);

    const { data: updated, error } = await supabase
      .from('waitlist')
      .update({ status: 'refunded' })
      .eq('id', waitlistId)
      .select()
      .single();
    if (error) throw error;

    await sendWhatsApp(
      entry.phone,
      `Your ₹${entry.advance_deposit} waitlist advance has been refunded. Should reflect in 2-3 business days.`
    );

    return NextResponse.json({ entry: updated, refund });
  } catch (error) {
    return handleApiError(error);
  }
}
