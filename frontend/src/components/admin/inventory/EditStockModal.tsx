'use client';

import { useState } from 'react';

interface EditStockModalProps {
  bikeId: string;
  bikeName: string;
  currentAvailable: number;
  totalUnits: number;
  onRent: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditStockModal({
  bikeId,
  bikeName,
  currentAvailable,
  totalUnits,
  onRent,
  onClose,
  onSaved,
}: EditStockModalProps) {
  const [newTotal, setNewTotal] = useState(String(totalUnits));
  const [newAvailable, setNewAvailable] = useState(String(currentAvailable));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inRepair = Math.max(0, totalUnits - currentAvailable - onRent);

  const handleSave = async () => {
    const total = Number(newTotal);
    const available = Number(newAvailable);

    if (!Number.isInteger(total) || total < 1) {
      setError('Total units must be at least 1');
      return;
    }
    if (!Number.isInteger(available) || available < 0) {
      setError('Available units cannot be negative');
      return;
    }
    if (available > total) {
      setError(`Available (${available}) cannot exceed total (${total})`);
      return;
    }
    if (available + onRent > total) {
      setError(`Available + in use (${available + onRent}) cannot exceed total (${total})`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/inventory/${bikeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalUnits: total, availableUnits: available }),
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
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0d2a20] border border-[#163a2c] rounded-2xl p-6 max-w-[400px] w-full">
        <h2 className="font-display text-[16px] text-white mb-1">Edit stock</h2>
        <p className="text-[12px] text-[#9fd8bc] mb-4">{bikeName}</p>

        {/* Current state summary */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: 'In use', value: onRent, color: 'text-[#f5d6a8]' },
            { label: 'In repair', value: inRepair, color: 'text-[#f5b0b0]' },
            { label: 'Available', value: currentAvailable, color: 'text-[#7adbb4]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#0a2018] rounded-[8px] p-3 text-center">
              <div className={`text-[20px] font-bold ${color}`}>{value}</div>
              <div className="text-[10px] text-[#6aaa88] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#9fd8bc] mb-1.5">
              Total units <span className="text-[#6aaa88] font-normal">(physical bikes owned)</span>
            </label>
            <input
              type="number"
              value={newTotal}
              onChange={(e) => setNewTotal(e.target.value)}
              min={1}
              className="w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white focus:outline-none focus:border-[#0F6E56]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#9fd8bc] mb-1.5">
              Available units <span className="text-[#6aaa88] font-normal">(ready for booking)</span>
            </label>
            <input
              type="number"
              value={newAvailable}
              onChange={(e) => setNewAvailable(e.target.value)}
              min={0}
              className="w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white focus:outline-none focus:border-[#0F6E56]"
            />
            <p className="text-[10px] text-[#6aaa88] mt-1">
              {onRent} currently in use — reduce available to send bikes to repair
            </p>
          </div>
        </div>

        {error && <p className="text-[12px] text-[#f5b0b0] mb-3">{error}</p>}

        <div className="flex gap-2">
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
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
