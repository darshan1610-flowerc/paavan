'use client';

import { useCallback, useEffect, useState } from 'react';
import CountdownTimer from '@/components/admin/deposits/CountdownTimer';
import WithholdModal from '@/components/admin/deposits/WithholdModal';

type Tab = 'pending_review' | 'approved' | 'withheld';

interface Deposit {
  id: string;
  amount: number;
  status: string;
  return_video_path: string | null;
  submitted_at: string | null;
  window_closes_at: string | null;
  reviewed_at: string | null;
  notes: string | null;
  booking_id: string;
  user_id: string;
  bookings: { booking_ref: string } | null;
  user: { name: string | null; phone: string; aadhaar_status: string } | null;
}

export default function DepositReturnsPage() {
  const [tab, setTab] = useState<Tab>('pending_review');
  const [deposits, setDeposits] = useState<Deposit[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [withholdTarget, setWithholdTarget] = useState<Deposit | null>(null);

  const load = useCallback(() => {
    fetch(`/api/admin/deposits?status=${tab}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Failed to load deposits');
        setDeposits(body.deposits);
      })
      .catch((e) => setError(e.message));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  // Subscribe to "now" via a ticking clock rather than calling Date.now()
  // directly during render — keeps the closingSoonCount derivation pure.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const closingSoonCount =
    tab === 'pending_review'
      ? (deposits ?? []).filter(
          (d) => d.window_closes_at && new Date(d.window_closes_at).getTime() - now < 4 * 60 * 60 * 1000
        ).length
      : 0;

  const handleOpenSignedUrl = async (path: string) => {
    setError('');
    try {
      const res = await fetch(path);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not open document');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
  };

  const handleApprove = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch('/api/admin/deposits/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to approve');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusyId(null);
    }
  };

  const handleWithhold = async (reason: string) => {
    if (!withholdTarget) return;
    setError('');
    const res = await fetch('/api/admin/deposits/withhold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId: withholdTarget.id, reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Failed to withhold');
      return;
    }
    setWithholdTarget(null);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-[24px] text-white mb-1">Deposit returns</h1>
      <p className="text-[12px] text-[#9fd8bc] mb-5">Review nightly — refund windows are time-sensitive.</p>

      {closingSoonCount > 0 && (
        <div className="bg-[#3a1414] border border-[#5a2020] rounded-[10px] px-4 py-3 mb-5 text-[13px] text-[#f5b0b0] font-semibold">
          ⚠ {closingSoonCount} deposit window(s) closing in the next 4 hours — review now
        </div>
      )}

      <div className="flex gap-2 mb-5">
        {([
          { id: 'pending_review', label: 'Pending review' },
          { id: 'approved', label: 'Approved' },
          { id: 'withheld', label: 'Withheld' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-[8px] ${
              tab === t.id ? 'bg-[#0F6E56] text-white' : 'text-[#9fd8bc] border border-[#1f4a38] hover:bg-[#163a2c]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-[13px] text-[#f5b0b0] mb-4">{error}</p>}

      {!deposits ? (
        <p className="text-[13px] text-[#9fd8bc]">Loading...</p>
      ) : deposits.length === 0 ? (
        <p className="text-[13px] text-[#9fd8bc]">Nothing here.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {deposits.map((d) => (
            <div key={d.id} className="bg-[#0d2a20] border border-[#163a2c] rounded-[10px] p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[14px] font-bold text-white">{d.user?.name ?? '—'}</div>
                  <div className="text-[11px] text-[#9fd8bc]">{d.bookings?.booking_ref}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    d.user?.aadhaar_status === 'verified' ? 'bg-[#163a2c] text-[#7adbb4]' : 'bg-[#3a1414] text-[#f5b0b0]'
                  }`}
                >
                  Aadhaar {d.user?.aadhaar_status === 'verified' ? 'Verified ✓' : 'Not verified ✗'}
                </span>
              </div>

              <div className="text-[12px] text-[#9fd8bc] mb-1">
                Bike returned at: {d.submitted_at ? new Date(d.submitted_at).toLocaleString('en-IN') : '—'}
              </div>
              {tab === 'pending_review' && d.window_closes_at && (
                <div className="text-[12px] text-[#9fd8bc] mb-3">
                  Window closes in: <CountdownTimer closesAt={d.window_closes_at} />
                </div>
              )}
              {d.notes && tab !== 'pending_review' && (
                <div className="text-[12px] text-[#9fd8bc] mb-3">Notes: {d.notes}</div>
              )}

              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => handleOpenSignedUrl(`/api/admin/deposits/video-url/${d.id}`)}
                  disabled={!d.return_video_path}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#9fd8bc] border border-[#1f4a38] rounded-[6px] hover:bg-[#163a2c] disabled:opacity-40"
                >
                  Watch return video
                </button>
                <button
                  onClick={() => handleOpenSignedUrl(`/api/admin/aadhaar/url/${d.user_id}`)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#9fd8bc] border border-[#1f4a38] rounded-[6px] hover:bg-[#163a2c]"
                >
                  View Aadhaar
                </button>
              </div>

              {tab === 'pending_review' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(d.id)}
                    disabled={busyId === d.id}
                    className="flex-1 py-2 text-[12px] font-bold bg-[#0F6E56] text-white rounded-[8px] hover:bg-[#085041] disabled:opacity-50"
                  >
                    Approve & refund ₹{d.amount}
                  </button>
                  <button
                    onClick={() => setWithholdTarget(d)}
                    disabled={busyId === d.id}
                    className="flex-1 py-2 text-[12px] font-bold bg-[#a32d2d] text-white rounded-[8px] hover:bg-[#852424] disabled:opacity-50"
                  >
                    Report damage
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {withholdTarget && (
        <WithholdModal onClose={() => setWithholdTarget(null)} onConfirm={handleWithhold} />
      )}
    </div>
  );
}
