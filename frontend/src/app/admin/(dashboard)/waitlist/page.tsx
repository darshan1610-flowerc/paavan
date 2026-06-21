'use client';

import { useCallback, useEffect, useState } from 'react';

interface WaitlistEntry {
  id: string;
  position: number | null;
  advance_deposit: number;
  status: string;
  notified_at: string | null;
  created_at: string;
  phone: string;
  bike_id: string;
  users: { name: string | null } | null;
  bikes: { name: string } | null;
}

interface Bike {
  id: string;
  name: string;
}

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[] | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [bikeId, setBikeId] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/inventory')
      .then((res) => res.json())
      .then((data) => setBikes(data.bikes ?? []))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    const params = bikeId ? `?bikeId=${bikeId}` : '';
    fetch(`/api/admin/waitlist${params}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Failed to load waitlist');
        setEntries(body.waitlist);
      })
      .catch((e) => setError(e.message));
  }, [bikeId]);

  useEffect(() => { load(); }, [load]);

  const runAction = async (path: 'notify' | 'refund', id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/waitlist/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitlistId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Action failed');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusyId(null);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      waiting: 'bg-[#163a2c] text-[#7adbb4]',
      notified: 'bg-[#3a2e14] text-[#f5d6a8]',
      converted: 'bg-[#0F6E56] text-white',
      refunded: 'bg-[#3a1414] text-[#f5b0b0]',
    };
    return styles[status] ?? 'bg-[#163a2c] text-[#9fd8bc]';
  };

  return (
    <div>
      <h1 className="font-display text-[24px] text-white mb-6">Waitlist</h1>

      <div className="mb-5">
        <select
          value={bikeId}
          onChange={(e) => setBikeId(e.target.value)}
          className="px-3 py-2 bg-[#0d2a20] border border-[#1f4a38] rounded-[8px] text-[12px] text-white"
        >
          <option value="">All bikes</option>
          {bikes.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {error && <p className="text-[13px] text-[#f5b0b0] mb-4">{error}</p>}

      {!entries ? (
        <p className="text-[13px] text-[#9fd8bc]">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-[13px] text-[#9fd8bc]">No one on the waitlist.</p>
      ) : (
        <div className="bg-[#0d2a20] border border-[#163a2c] rounded-[10px] overflow-x-auto">
          <table className="w-full text-[12px] min-w-[760px]">
            <thead>
              <tr className="text-[#9fd8bc] text-left border-b border-[#163a2c]">
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Bike</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Advance paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-[#163a2c] text-white">
                  <td className="py-3 px-4">{e.position ?? '—'}</td>
                  <td className="py-3 px-4">{e.bikes?.name ?? '—'}</td>
                  <td className="py-3 px-4">{e.users?.name ?? '—'}</td>
                  <td className="py-3 px-4">+91 {e.phone}</td>
                  <td className="py-3 px-4">{new Date(e.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4">₹{e.advance_deposit}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusBadge(e.status)}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {(e.status === 'waiting' || e.status === 'notified') && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => runAction('notify', e.id)}
                          disabled={busyId === e.id}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#7adbb4] border border-[#1f4a38] rounded-[6px] hover:bg-[#163a2c] disabled:opacity-50"
                        >
                          Notify
                        </button>
                        <button
                          onClick={() => runAction('refund', e.id)}
                          disabled={busyId === e.id || !e.payment_id}
                          title={!e.payment_id ? 'No advance payment on file' : 'Refund advance deposit'}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#f5b0b0] border border-[#3a1414] rounded-[6px] hover:bg-[#3a1414] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Refund
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
