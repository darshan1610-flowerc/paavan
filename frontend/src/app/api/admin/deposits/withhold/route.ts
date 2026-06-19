import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { validateBody } from '@/lib/server/validate';
import { handleApiError } from '@/lib/server/errors';
import { depositWithholdSchema } from '@/lib/schemas/admin';
import { sendWhatsApp } from '@/lib/server/notify/whatsapp';

interface DepositRow {
  id: string;
  amount: number;
  status: string;
  users: { phone: string } | null;
  bookings: { booking_ref: string } | null;
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireAdmin(req);
    const { depositId, reason } = await validateBody(depositWithholdSchema, req);

    const { data: fetched, error: fetchError } = await supabase
      .from('deposits')
      .select('id, amount, status, users(phone), bookings(booking_ref)')
      .eq('id', depositId)
      .single();

    if (fetchError || !fetched) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }
    const deposit = fetched as unknown as DepositRow;

    if (deposit.status !== 'pending_review') {
      return NextResponse.json({ error: 'Only deposits pending review can be withheld' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('deposits')
      .update({
        status: 'withheld',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        notes: reason,
      })
      .eq('id', depositId)
      .select()
      .single();

    if (error) throw error;

    if (deposit.users?.phone) {
      await sendWhatsApp(
        deposit.users.phone,
        `Your ₹${deposit.amount} deposit for booking ${deposit.bookings?.booking_ref} has been withheld: ${reason}. Contact us if you have questions.`
      );
    }

    return NextResponse.json({ deposit: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
