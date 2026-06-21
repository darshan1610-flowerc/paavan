'use client';

import { useState } from 'react';

interface AddBikeModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function AddBikeModal({ onClose, onCreated }: AddBikeModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState<string[]>(['']);
  const [totalUnits, setTotalUnits] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) return setError('Bike name is required');
    if (!totalUnits || Number(totalUnits) < 1) {
      return setError('Total units must be at least 1');
    }

    setSubmitting(true);
    try {
      let imagePath: string | undefined;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/admin/inventory/upload-image', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error ?? 'Image upload failed');
        imagePath = uploadData.url;
      }

      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          specs: specs.filter(s => s.trim()),
          totalUnits: Number(totalUnits),
          imagePath,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create bike');

      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0d2a20] border border-[#163a2c] rounded-2xl p-6 max-w-[480px] w-full max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-[18px] text-white mb-4">Add new bike model</h2>

        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bike name"
            className="w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white focus:outline-none focus:border-[#0F6E56]"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={2}
            className="w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white focus:outline-none focus:border-[#0F6E56]"
          />
          <div>
            <label className="block text-[11px] font-semibold text-[#9fd8bc] mb-1.5">
              Specs <span className="text-[#6aaa88] font-normal">(one per line, e.g. "48 km range", "Dual disc brakes")</span>
            </label>
            {specs.map((spec, i) => (
              <div key={i} className="flex gap-2 mb-1.5">
                <input
                  value={spec}
                  onChange={(e) => {
                    const updated = [...specs];
                    updated[i] = e.target.value;
                    setSpecs(updated);
                  }}
                  placeholder={`Spec ${i + 1}`}
                  className="flex-1 px-3.5 py-2 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white focus:outline-none focus:border-[#0F6E56]"
                />
                {specs.length > 1 && (
                  <button
                    onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
                    className="text-[#f5b0b0] text-[18px] px-2 hover:text-white"
                  >×</button>
                )}
              </div>
            ))}
            <button
              onClick={() => setSpecs([...specs, ''])}
              className="text-[11px] text-[#7adbb4] hover:underline mt-0.5"
            >+ Add spec</button>
          </div>
          <input
            value={totalUnits}
            onChange={(e) => setTotalUnits(e.target.value.replace(/\D/g, ''))}
            placeholder="Total units"
            className="w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white focus:outline-none focus:border-[#0F6E56]"
          />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-[12px] text-[#9fd8bc]"
          />
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
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 text-[13px] font-bold bg-[#0F6E56] text-white rounded-[8px] hover:bg-[#085041] disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add bike'}
          </button>
        </div>
      </div>
    </div>
  );
}
