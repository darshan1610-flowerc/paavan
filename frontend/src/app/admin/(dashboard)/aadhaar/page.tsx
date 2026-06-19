'use client';

import { useCallback, useEffect, useState } from 'react';
import RejectModal from '@/components/admin/aadhaar/RejectModal';

interface PendingRow {
  id: string;
  booking_ref: string;
  created_at: string;
  user_id: string;
  users: {
    id: string;
    name: string | null;
    phone: string;
    aadhaar_file_path: string | null;
    aadhaar_submitted_at: string | null;
    aadhaar_status: string;
  } | null;
}

export default function AadhaarVerifyPage() {
  const [rows, setRows] = useState<PendingRow[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingRow | null>(null);

  const load = useCallback(() => {
    fetch('/api/admin/aadhaar')
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Failed to load pending verifications');
        setRows(body.pending);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleOpenAadhaar = async (userId: string) => {
    setBusyId(userId);
    try {
      const res = await fetch(`/api/admin/aadhaar/url/${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not load document');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusyId(null);
    }
  };

  const handleVerify = async (userId: string) => {
    setBusyId(userId);
    try {
      const res = await fetch('/api/admin/aadhaar/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to verify');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget?.user_id) return;
    setError('');
    const res = await fetch('/api/admin/aadhaar/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: rejectTarget.user_id, reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Failed to reject');
      return;
    }
    setRejectTarget(null);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-[24px] text-white mb-6">Aadhaar verification</h1>

      {error && <p className="text-[13px] text-[#f5b0b0] mb-4">{error}</p>}

      {!rows ? (
        <p className="text-[13px] text-[#9fd8bc]">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-[13px] text-[#9fd8bc]">No pending Aadhaar verifications.</p>
      ) : (
        <div className="bg-[#0d2a20] border border-[#163a2c] rounded-[10px] overflow-x-auto">
          <table className="w-full text-[12px] min-w-[760px]">
            <thead>
              <tr className="text-[#9fd8bc] text-left border-b border-[#163a2c]">
                <th className="py-3 px-4">Rider</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Booking ref</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user_id} className="border-b border-[#163a2c] text-white">
                  <td className="py-3 px-4">{r.users?.name ?? '—'}</td>
                  <td className="py-3 px-4">+91 {r.users?.phone ?? '—'}</td>
                  <td className="py-3 px-4">{r.booking_ref}</td>
                  <td className="py-3 px-4">
                    {r.users?.aadhaar_submitted_at ? new Date(r.users.aadhaar_submitted_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleOpenAadhaar(r.user_id)}
                      disabled={busyId === r.user_id || !r.users?.aadhaar_file_path}
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#9fd8bc] border border-[#1f4a38] rounded-[6px] hover:bg-[#163a2c] disabled:opacity-40"
                    >
                      Open Aadhaar
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleVerify(r.user_id)}
                        disabled={busyId === r.user_id}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#7adbb4] border border-[#1f4a38] rounded-[6px] hover:bg-[#163a2c] disabled:opacity-50"
                      >
                        Verify ✓
                      </button>
                      <button
                        onClick={() => setRejectTarget(r)}
                        disabled={busyId === r.user_id}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#f5b0b0] border border-[#3a1414] rounded-[6px] hover:bg-[#3a1414] disabled:opacity-50"
                      >
                        Reject ✗
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejectTarget && (
        <RejectModal onClose={() => setRejectTarget(null)} onConfirm={handleReject} />
      )}
    </div>
  );
}
