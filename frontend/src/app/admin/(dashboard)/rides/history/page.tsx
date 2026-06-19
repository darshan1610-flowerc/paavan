'use client';

import { useCallback, useEffect, useState } from 'react';
import BookingDetailModal from '@/components/admin/rides/BookingDetailModal';

interface HistoryRow {
  id: string;
  booking_ref: string;
  start_date: string;
  end_date: string;
  total_paid: number;
  deposit_amount: number;
  payment_id: string | null;
  status: string;
  created_at: string;
  user_id: string;
  users: { name: string | null; phone: string } | null;
  bikes: { name: string } | null;
  plans: { name: string; duration_days: number } | null;
  deposits: { status: string }[] | null;
}

interface Bike {
  id: string;
  name: string;
}

function toCsv(rows: HistoryRow[]) {
  const header = ['Booking ref', 'Rider', 'Phone', 'Bike', 'Plan', 'Total paid', 'Deposit status', 'Status', 'Created at'];
  const lines = rows.map((r) =>
    [
      r.booking_ref,
      r.users?.name ?? '',
      r.users?.phone ?? '',
      r.bikes?.name ?? '',
      r.plans?.name ?? '',
      r.total_paid,
      r.deposits?.[0]?.status ?? '',
      r.status,
      r.created_at,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header.join(','), ...lines].join('\n');
}

export default function RideHistoryPage() {
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<HistoryRow | null>(null);

  const [bikeId, setBikeId] = useState('');
  const [status, setStatus] = useState('');
  const [month, setMonth] = useState('');

  useEffect(() => {
    fetch('/api/admin/inventory')
      .then((res) => res.json())
      .then((data) => setBikes(data.bikes ?? []))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (bikeId) params.set('bikeId', bikeId);
    if (status) params.set('status', status);
    if (month) params.set('month', month);

    fetch(`/api/admin/rides/history?${params}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Failed to load ride history');
        setRows(body.bookings);
      })
      .catch((e) => setError(e.message));
  }, [bikeId, status, month]);

  useEffect(() => { load(); }, [load]);

  const handleExport = () => {
    if (!rows || rows.length === 0) return;
    const blob = new Blob([toCsv(rows)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paavan-ride-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-[24px] text-white">Ride history</h1>
        <button
          onClick={handleExport}
          disabled={!rows || rows.length === 0}
          className="px-4 py-2 text-[13px] font-bold bg-[#0F6E56] text-white rounded-[8px] hover:bg-[#085041] disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <select value={bikeId} onChange={(e) => setBikeId(e.target.value)} className="px-3 py-2 bg-[#0d2a20] border border-[#1f4a38] rounded-[8px] text-[12px] text-white">
          <option value="">All bikes</option>
          {bikes.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 bg-[#0d2a20] border border-[#1f4a38] rounded-[8px] text-[12px] text-white">
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 bg-[#0d2a20] border border-[#1f4a38] rounded-[8px] text-[12px] text-white"
        />
      </div>

      {error && <p className="text-[13px] text-[#f5b0b0] mb-4">{error}</p>}

      {!rows ? (
        <p className="text-[13px] text-[#9fd8bc]">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-[13px] text-[#9fd8bc]">No rides match these filters.</p>
      ) : (
        <div className="bg-[#0d2a20] border border-[#163a2c] rounded-[10px] overflow-x-auto">
          <table className="w-full text-[12px] min-w-[760px]">
            <thead>
              <tr className="text-[#9fd8bc] text-left border-b border-[#163a2c]">
                <th className="py-3 px-4">Rider</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Bike</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Rental paid</th>
                <th className="py-3 px-4">Deposit status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="border-b border-[#163a2c] text-white cursor-pointer hover:bg-[#163a2c]"
                >
                  <td className="py-3 px-4">{r.users?.name ?? '—'}</td>
                  <td className="py-3 px-4">+91 {r.users?.phone ?? '—'}</td>
                  <td className="py-3 px-4">{r.bikes?.name ?? '—'}</td>
                  <td className="py-3 px-4">{r.plans?.name ?? '—'}</td>
                  <td className="py-3 px-4">₹{r.total_paid.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 capitalize">{r.deposits?.[0]?.status ?? '—'}</td>
                  <td className="py-3 px-4">{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <BookingDetailModal booking={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
