'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import StepIndicator from '@/components/StepIndicator';
import Footer from '@/components/Footer';

// Configure your company's UPI ID here for the QR code payment
const COMPANY_UPI_ID = 'paavan.goelectric@okaxis'; // <-- Replace with your real company VPA
const COMPANY_UPI_NAME = 'PAAVAN Go-Electric';

const STEPS = [
  { label: 'Select bike' },
  { label: 'Choose plan' },
  { label: 'Details' },
  { label: 'Payment' },
];

interface ActiveRide {
  bookingId: string;
  bike: string;
  plan: string;
  duration: string;
  total: number;
  name: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const [ride, setRide] = useState<ActiveRide | null>(null);
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('paavan_active_ride');
    if (raw) setRide(JSON.parse(raw));
  }, []);

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    if (!ride) return;
    setErrorMsg('');
    setProcessing(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

      // 1. Create order on the backend
      const resOrder = await fetch(`${backendUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: ride.bookingId,
          amount: ride.total,
        }),
      });

      if (!resOrder.ok) {
        const errData = await resOrder.json();
        throw new Error(errData.error || 'Failed to initialize payment order.');
      }

      const orderData = await resOrder.json();

      // 2. Mock mode bypass when keys are missing
      if (orderData.mock) {
        console.log('Simulating payment success in sandbox mode...');
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const resVerify = await fetch(`${backendUrl}/api/payment/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: ride.bookingId,
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: 'mock_signature_bypass',
          }),
        });

        if (!resVerify.ok) {
          const errData = await resVerify.json();
          throw new Error(errData.error || 'Failed to verify mock payment.');
        }

        localStorage.setItem('paavan_payment_confirmed', 'true');
        router.push('/success');
        return;
      }

      // 3. Real Razorpay Checkout integration
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: COMPANY_UPI_NAME,
        description: `Booking ride for ${ride.bike}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            setProcessing(true);
            const resVerify = await fetch(`${backendUrl}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId: ride.bookingId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!resVerify.ok) {
              const errData = await resVerify.json();
              throw new Error(errData.error || 'Payment verification failed.');
            }

            localStorage.setItem('paavan_payment_confirmed', 'true');
            router.push('/success');
          } catch (err: any) {
            setErrorMsg(err.message || 'Payment verification failed.');
            setProcessing(false);
          }
        },
        prefill: {
          name: ride.name,
        },
        theme: {
          color: '#0F6E56',
        },
        modal: {
          ondismiss: function () {
            setErrorMsg('Payment was cancelled by the user.');
            setProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setErrorMsg(response.error.description || 'Payment was canceled or failed.');
        setProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Could not initiate payment. Try again.');
      setProcessing(false);
    }
  };

  const payMethods = [
    {
      id: 'upi' as const,
      label: 'UPI — Google Pay, PhonePe, Paytm',
      icon: (
        <svg className="w-5 h-5 stroke-[#0F6E56] fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      ),
    },
    {
      id: 'card' as const,
      label: 'Debit / Credit card',
      icon: (
        <svg className="w-5 h-5 stroke-[#0F6E56] fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <path d="M1 10h22" />
        </svg>
      ),
    },
    {
      id: 'netbanking' as const,
      label: 'Net banking',
      icon: (
        <svg className="w-5 h-5 stroke-[#0F6E56] fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
  ];

  return (
    <main className="min-h-screen">
      <div className="max-w-[600px] mx-auto px-6 py-10">
        <StepIndicator steps={STEPS} currentStep={4} />

        <div className="bg-white border border-[#cce0cc] rounded-xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          <h1 className="font-display text-[24px] text-[#04342C] mb-1">Complete your payment</h1>
          <p className="text-[13px] text-[#7a9080] mb-6">
            Total:{' '}
            <strong className="text-[#0F6E56] text-[17px]">
              ₹{ride?.total.toLocaleString('en-IN') ?? '—'}
            </strong>
          </p>

          <div className="text-[10px] font-bold text-[#9ab09a] tracking-wider uppercase mb-3">
            Payment method
          </div>

          <div className="space-y-2.5 mb-6">
            {payMethods.map((m) => (
              <label
                key={m.id}
                className={`flex items-center gap-3 px-4 py-3.5 border rounded-[8px] cursor-pointer transition-all ${
                  method === m.id
                    ? 'border-[#0F6E56] bg-[#f0fbf7]'
                    : 'border-[#cce0cc] hover:border-[#1D9E75]'
                }`}
              >
                <input
                  type="radio"
                  name="pay"
                  value={m.id}
                  checked={method === m.id}
                  onChange={() => setMethod(m.id)}
                  className="accent-[#0F6E56]"
                />
                {m.icon}
                <span className="text-[13px] font-semibold text-[#04342C]">{m.label}</span>
              </label>
            ))}
          </div>

          <div className="bg-[#FAEEDA] border border-[#f0c060] rounded-[8px] p-3.5 mb-6 text-[12px] text-[#854F0B] font-medium leading-relaxed">
            📋 After payment, <strong>show this confirmation to our campus operator</strong>. They will
            deliver your bike to you on campus and hand you your first daily unlock code.
          </div>

          {errorMsg && (
            <div className="mb-4 text-[13px] font-semibold text-[#A32D2D] bg-[#FCEBEB] border border-[#F5C2C2] rounded-lg p-3 text-center">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full py-3.5 bg-[#0F6E56] text-white text-[14px] font-bold rounded-[8px] hover:bg-[#085041] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(15,110,86,0.3)] disabled:opacity-75"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing payment...
              </span>
            ) : (
              `Pay ₹${ride?.total.toLocaleString('en-IN') ?? ''} securely via Razorpay →`
            )}
          </button>

          <p className="text-center text-[11px] text-[#9ab09a] mt-3">
            🔒 Secured by Razorpay · 256-bit SSL · PCI-DSS compliant
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
