import Razorpay from 'razorpay';

interface RefundResult {
  id: string;
  status: 'processed' | 'stubbed';
}

function isConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

// Refunds a deposit. If Razorpay credentials aren't configured yet, logs
// and returns a stubbed result instead of throwing — callers (deposit
// approval) treat both paths identically and record the result in
// deposits.notes, so wiring the real keys later needs zero code changes.
export async function refundDeposit(paymentId: string, amountRupees: number): Promise<RefundResult> {
  if (!isConfigured()) {
    console.log(`[razorpay] not configured — skipping real refund for payment ${paymentId} (₹${amountRupees})`);
    return { id: `mock_refund_${paymentId}`, status: 'stubbed' };
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const refund = await razorpay.payments.refund(paymentId, {
    amount: amountRupees * 100, // Razorpay amounts are in paise
  });

  return { id: refund.id, status: 'processed' };
}
