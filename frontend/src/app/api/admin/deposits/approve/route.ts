import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/requireAdmin';
import { validateBody } from '@/lib/server/validate';
import { handleApiError } from '@/lib/server/errors';
import { depositApproveSchema } from '@/lib/schemas/admin';
import { refundDeposit } from '@/lib/server/payments/razorpay';
import { sendWhatsApp } from '@/lib/server/notify/whatsapp';

interface DepositRow {
  id: string;
  amount: number;
  status: string;
  booking_id: string;
  users: { phone: string } | null;
  bookings: { payment_id: string | null; booking_ref: string } | null;
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireAdmin(req);
    const { depositId } = await validateBody(depositApproveSchema, req);

    const { data: fetched, error: fetchError } = await supabase
      .from('deposits')
      .select('id, amount, status, booking_id, users!deposits_user_id_fkey(phone), bookings(payment_id, booking_ref)')
      .eq('id', depositId)
      .single();

    if (fetchError || !fetched) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }
    const deposit = fetched as unknown as DepositRow;

    if (deposit.status !== 'pending_review') {
      return NextResponse.json({ error: 'Only deposits pending review can be approved' }, { status: 400 });
    }

    const paymentId = deposit.bookings?.payment_id;
    if (!paymentId) {
      return NextResponse.json({ error: 'No payment on file for this booking — cannot refund' }, { status: 400 });
    }

    const refund = await refundDeposit(paymentId, deposit.amount);

    const { data: updated, error } = await supabase
      .from('deposits')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        notes: `Refund ${refund.status}: ${refund.id}`,
      })
      .eq('id', depositId)
      .select()
      .single();

    if (error) throw error;

    // Bike is back — increment available_units and mark booking completed
    const { data: booking } = await supabase
      .from('bookings')
      .select('bike_id')
      .eq('id', deposit.booking_id)
      .single();

    if (booking?.bike_id) {
      const { data: bike } = await supabase
        .from('bikes')
        .select('available_units, total_units')
        .eq('id', booking.bike_id)
        .single();

      if (bike) {
        await supabase
          .from('bikes')
          .update({ available_units: Math.min(bike.total_units, bike.available_units + 1) })
          .eq('id', booking.bike_id);
      }

      await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', deposit.booking_id);
    }

    if (deposit.users?.phone) {
      await sendWhatsApp(
        deposit.users.phone,
        `Your ₹${deposit.amount} deposit for booking ${deposit.bookings?.booking_ref} has been refunded. Should reflect in 2-3 business days.`
      );
    }

    return NextResponse.json({ deposit: updated, refund });
  } catch (error) {
    return handleApiError(error);
  }
}
