'use client';

import { useState } from 'react';

interface EditStockModalProps {
  bikeId: string;
  bikeName: string;
  currentAvailable: number;
  totalUnits: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditStockModal({ bikeId, bikeName, currentAvailable, totalUnits, onClose, onSaved }: EditStockModalProps) {
  const [value, setValue] = useState(String(currentAvailable));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > totalUnits) {
      setError(`Must be a whole number between 0 and ${totalUnits}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/inventory/${bikeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableUnits: n }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update stock');
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0d2a20] border border-[#163a2c] rounded-2xl p-6 max-w-[360px] w-full">
        <h2 className="font-display text-[16px] text-white mb-1">Edit stock</h2>
        <p className="text-[12px] text-[#9fd8bc] mb-4">{bikeName} · total {totalUnits} units</p>

        <label className="block text-[11px] font-semibold text-[#9fd8bc] mb-1.5">Available units</label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min={0}
          max={totalUnits}
          className="w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white focus:outline-none focus:border-[#0F6E56]"
        />

        {error && <p className="text-[12px] text-[#f5b0b0] mt-2">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-[13px] font-semibold text-[#9fd8bc] border border-[#1f4a38] rounded-[8px] hover:bg-[#163a2c]">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex-1 py-2.5 text-[13px] font-bold bg-[#0F6E56] text-white rounded-[8px] hover:bg-[#085041] disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
