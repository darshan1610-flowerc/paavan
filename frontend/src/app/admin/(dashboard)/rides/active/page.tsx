'use client';

import { useCallback, useEffect, useState } from 'react';
import BookingDetailModal from '@/components/admin/rides/BookingDetailModal';

interface Ride {
  id: string;
  booking_ref: string;
  start_date: string;
  end_date: string;
  total_paid: number;
  deposit_amount: number;
  payment_id: string | null;
  daysLeft: number;
  users: { name: string | null; phone: string } | null;
  bikes: { id: string; name: string } | null;
  plans: { id: string; name: string; type: string; duration_days: number } | null;
}

interface Bike {
  id: string;
  name: string;
}

export default function ActiveRidesPage() {
  const [rides, setRides] = useState<Ride[] | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Ride | null>(null);

  const [bikeId, setBikeId] = useState('');
  const [planType, setPlanType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/inventory')
      .then((res) => res.json())
      .then((data) => setBikes(data.bikes ?? []))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (bikeId) params.set('bikeId', bikeId);
    if (planType) params.set('planType', planType);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (search) params.set('search', search);

    fetch(`/api/admin/rides/active?${params}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Failed to load active rides');
        setRides(body.rides);
      })
      .catch((e) => setError(e.message));
  }, [bikeId, planType, dateFrom, dateTo, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const rowClass = (daysLeft: number) => {
    if (daysLeft <= 0) return 'bg-[#3a1414]';
    if (daysLeft < 2) return 'bg-[#3a2e14]';
    return '';
  };

  return (
    <div>
      <h1 className="font-display text-[24px] text-white mb-6">Active rides</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={bikeId}
          onChange={(e) => setBikeId(e.target.value)}
          className="px-3 py-2 bg-[#0d2a20] border border-[#1f4a38] rounded-[8px] text-[12px] text-white"
        >
          <option value="">All bikes</option>
          {bikes.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select
          value={planType}
          onChange={(e) => setPlanType(e.target.value)}
          className="px-3 py-2 bg-[#0d2a20] border border-[#1f4a38] rounded-[8px] text-[12px] text-white"
        >
          <option value="">All plan types</option>
          <option value="student">Student</option>
          <option value="delivery">Delivery</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2 bg-[#0d2a20] border border-[#1f4a38] rounded-[8px] text-[12px] text-white"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2 bg-[#0d2a20] border border-[#1f4a38] rounded-[8px] text-[12px] text-white"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or phone"
          className="px-3 py-2 bg-[#0d2a20] border border-[#1f4a38] rounded-[8px] text-[12px] text-white flex-1 min-w-[160px]"
        />
      </div>

      {error && <p className="text-[13px] text-[#f5b0b0] mb-4">{error}</p>}

      {!rides ? (
        <p className="text-[13px] text-[#9fd8bc]">Loading...</p>
      ) : rides.length === 0 ? (
        <p className="text-[13px] text-[#9fd8bc]">No active rides match these filters.</p>
      ) : (
        <div className="bg-[#0d2a20] border border-[#163a2c] rounded-[10px] overflow-x-auto">
          <table className="w-full text-[12px] min-w-[820px]">
            <thead>
              <tr className="text-[#9fd8bc] text-left border-b border-[#163a2c]">
                <th className="py-3 px-4">Rider</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Bike</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Start</th>
                <th className="py-3 px-4">End</th>
                <th className="py-3 px-4">Days left</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((r) => (
                <tr key={r.id} className={`border-b border-[#163a2c] text-white ${rowClass(r.daysLeft)}`}>
                  <td className="py-3 px-4">{r.users?.name ?? '—'}</td>
                  <td className="py-3 px-4">+91 {r.users?.phone ?? '—'}</td>
                  <td className="py-3 px-4">{r.bikes?.name ?? '—'}</td>
                  <td className="py-3 px-4">{r.plans?.name ?? '—'}</td>
                  <td className="py-3 px-4">{r.start_date}</td>
                  <td className="py-3 px-4">{r.end_date}</td>
                  <td className="py-3 px-4">{r.daysLeft}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelected(r)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#9fd8bc] border border-[#1f4a38] rounded-[6px] hover:bg-[#163a2c]"
                    >
                      View details
                    </button>
                  </td>
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
