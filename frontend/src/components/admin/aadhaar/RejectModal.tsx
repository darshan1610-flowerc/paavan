'use client';

import { useState } from 'react';

interface RejectModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function RejectModal({ onClose, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Please describe why the document is being rejected');
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0d2a20] border border-[#163a2c] rounded-2xl p-6 max-w-[400px] w-full">
        <h2 className="font-display text-[16px] text-white mb-1">Reject Aadhaar document</h2>
        <p className="text-[12px] text-[#9fd8bc] mb-4">The rider will be notified via SMS with this reason.</p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Document is blurry, please re-upload"
          rows={3}
          className="w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white focus:outline-none focus:border-[#0F6E56]"
        />

        {error && <p className="text-[12px] text-[#f5b0b0] mt-2">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-[13px] font-semibold text-[#9fd8bc] border border-[#1f4a38] rounded-[8px] hover:bg-[#163a2c]">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 text-[13px] font-bold bg-[#a32d2d] text-white rounded-[8px] hover:bg-[#852424] disabled:opacity-50"
          >
            {submitting ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}
