'use client';

import { useState } from 'react';

interface BookingDetailModalProps {
  booking: {
    booking_ref: string;
    start_date: string;
    end_date: string;
    total_paid: number;
    deposit_amount: number;
    payment_id: string | null;
    status?: string;
    user_id?: string;
    users: { name: string | null; phone: string } | null;
    bikes: { name: string } | null;
    plans: { name: string; duration_days: number } | null;
  };
  onClose: () => void;
}

export default function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
  const [aadhaarError, setAadhaarError] = useState('');
  const [loadingAadhaar, setLoadingAadhaar] = useState(false);

  const rows = [
    { label: 'Booking ref', value: booking.booking_ref },
    { label: 'Rider', value: booking.users?.name ?? '—' },
    { label: 'Phone', value: `+91 ${booking.users?.phone ?? '—'}` },
    { label: 'Bike', value: booking.bikes?.name ?? '—' },
    { label: 'Plan', value: booking.plans ? `${booking.plans.name} (${booking.plans.duration_days} days)` : '—' },
    { label: 'Start date', value: booking.start_date },
    { label: 'End date', value: booking.end_date },
    { label: 'Total paid', value: `₹${booking.total_paid.toLocaleString('en-IN')}` },
    { label: 'Deposit', value: `₹${booking.deposit_amount.toLocaleString('en-IN')}` },
    { label: 'Payment ID', value: booking.payment_id ?? '—' },
    ...(booking.status ? [{ label: 'Status', value: booking.status }] : []),
  ];

  const handleViewAadhaar = async () => {
    if (!booking.user_id) return;
    setAadhaarError('');
    setLoadingAadhaar(true);
    try {
      const res = await fetch(`/api/admin/aadhaar/url/${booking.user_id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not load Aadhaar document');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setAadhaarError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoadingAadhaar(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0d2a20] border border-[#163a2c] rounded-2xl p-6 max-w-[420px] w-full max-h-[85vh] overflow-y-auto">
        <h2 className="font-display text-[16px] text-white mb-4">Booking details</h2>
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between text-[13px] border-b border-[#163a2c] pb-2">
              <span className="text-[#9fd8bc]">{r.label}</span>
              <span className="text-white font-medium text-right capitalize">{r.value}</span>
            </div>
          ))}
        </div>

        {booking.user_id && (
          <button
            onClick={handleViewAadhaar}
            disabled={loadingAadhaar}
            className="w-full mt-4 py-2.5 text-[13px] font-semibold text-[#7adbb4] border border-[#1f4a38] rounded-[8px] hover:bg-[#163a2c] disabled:opacity-50"
          >
            {loadingAadhaar ? 'Opening...' : 'View Aadhaar document →'}
          </button>
        )}
        {aadhaarError && <p className="text-[12px] text-[#f5b0b0] mt-2">{aadhaarError}</p>}

        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 text-[13px] font-semibold text-[#9fd8bc] border border-[#1f4a38] rounded-[8px] hover:bg-[#163a2c]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
