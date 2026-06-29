'use client';

import { useState } from 'react';

interface EditPricingModalProps {
  bikeId: string;
  bikeName: string;
  currentPricePerDay: number;
  currentPricePerWeek: number;
  currentPricePerMonth: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditPricingModal({
  bikeId,
  bikeName,
  currentPricePerDay,
  currentPricePerWeek,
  currentPricePerMonth,
  onClose,
  onSaved,
}: EditPricingModalProps) {
  const [day, setDay] = useState(String(currentPricePerDay ?? 0));
  const [week, setWeek] = useState(String(currentPricePerWeek ?? 0));
  const [month, setMonth] = useState(String(currentPricePerMonth ?? 0));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    const d = Number(day);
    const w = Number(week);
    const m = Number(month);
    if (
      !Number.isInteger(d) || d < 0 ||
      !Number.isInteger(w) || w < 0 ||
      !Number.isInteger(m) || m < 0
    ) {
      setError('All prices must be non-negative whole numbers');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/inventory/${bikeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricePerDay: d, pricePerWeek: w, pricePerMonth: m }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update pricing');
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0d2a20] border border-[#163a2c] rounded-2xl p-6 max-w-[380px] w-full">
        <h2 className="font-display text-[16px] text-white mb-1">Edit pricing</h2>
        <p className="text-[12px] text-[#9fd8bc] mb-5">{bikeName}</p>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#9fd8bc] mb-1.5">Daily price (₹)</label>
            <input
              type="number"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              min={0}
              className="w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white focus:outline-none focus:border-[#0F6E56]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#9fd8bc] mb-1.5">Weekly price (₹)</label>
            <input
              type="number"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              min={0}
              className="w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white focus:outline-none focus:border-[#0F6E56]"
            />
            {week && Number(week) > 0 && (
              <p className="text-[10px] text-[#5db88a] mt-1">= ₹{Math.round(Number(week) / 7)}/day effective</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#9fd8bc] mb-1.5">Monthly price (₹)</label>
            <input
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              min={0}
              className="w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white focus:outline-none focus:border-[#0F6E56]"
            />
            {month && Number(month) > 0 && (
              <p className="text-[10px] text-[#5db88a] mt-1">= ₹{Math.round(Number(month) / 30)}/day effective</p>
            )}
          </div>

        </div>

        {error && <p className="text-[12px] text-[#f5b0b0] mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-[13px] font-semibold text-[#9fd8bc] border border-[#1f4a38] rounded-[8px] hover:bg-[#163a2c]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex-1 py-2.5 text-[13px] font-bold bg-[#0F6E56] text-white rounded-[8px] hover:bg-[#085041] disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save prices'}
          </button>
        </div>
      </div>
    </div>
  );
}
