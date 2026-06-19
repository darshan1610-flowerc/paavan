'use client';

import { useEffect, useState } from 'react';

interface DashboardData {
  stats: {
    totalBikes: number;
    currentlyRented: number;
    availableNow: number;
    inRepair: number;
    pendingDeposits: number;
    monthlyRevenue: number;
  };
  needsAttention: {
    pendingAadhaar: number;
    closingDeposits: { id: string; window_closes_at: string; bookings: { booking_ref: string } | null }[];
  };
  recentBookings: {
    id: string;
    booking_ref: string;
    status: string;
    total_paid: number;
    created_at: string;
    users: { name: string | null; phone: string } | null;
    bikes: { name: string } | null;
  }[];
}

function hoursUntil(iso: string) {
  const diffMs = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.round(diffMs / (60 * 60 * 1000) * 10) / 10);
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Failed to load dashboard');
        setData(body);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="text-[13px] text-[#f5b0b0]">{error}</div>;
  }
  if (!data) {
    return <div className="text-[13px] text-[#9fd8bc]">Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Total bikes', value: data.stats.totalBikes },
    { label: 'Currently rented', value: data.stats.currentlyRented },
    { label: 'Available now', value: data.stats.availableNow },
    { label: 'In repair', value: data.stats.inRepair },
    { label: 'Pending deposits', value: data.stats.pendingDeposits, red: true },
    { label: 'Monthly revenue', value: `₹${data.stats.monthlyRevenue.toLocaleString('en-IN')}` },
  ];

  return (
    <div>
      <h1 className="font-display text-[24px] text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statCards.map((c) => (
          <div key={c.label} className="bg-[#0d2a20] border border-[#163a2c] rounded-[10px] p-4">
            <div className={`text-[22px] font-bold ${c.red ? 'text-[#f5b0b0]' : 'text-white'}`}>{c.value}</div>
            <div className="text-[11px] text-[#9fd8bc] mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0d2a20] border border-[#163a2c] rounded-[10px] p-5 mb-6">
        <h2 className="text-[14px] font-bold text-white mb-3">Needs attention today</h2>
        {data.needsAttention.pendingAadhaar === 0 && data.needsAttention.closingDeposits.length === 0 ? (
          <p className="text-[12px] text-[#9fd8bc]">Nothing urgent right now.</p>
        ) : (
          <ul className="space-y-2">
            {data.needsAttention.pendingAadhaar > 0 && (
              <li className="text-[13px] text-[#f5d6a8]">
                {data.needsAttention.pendingAadhaar} Aadhaar verification(s) pending
              </li>
            )}
            {data.needsAttention.closingDeposits.map((d) => (
              <li key={d.id} className="text-[13px] text-[#f5b0b0]">
                Deposit window for {d.bookings?.booking_ref ?? 'booking'} closes in {hoursUntil(d.window_closes_at)}h
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-[#0d2a20] border border-[#163a2c] rounded-[10px] p-5">
        <h2 className="text-[14px] font-bold text-white mb-3">Recent bookings</h2>
        {data.recentBookings.length === 0 ? (
          <p className="text-[12px] text-[#9fd8bc]">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[#9fd8bc] text-left border-b border-[#163a2c]">
                  <th className="py-2 pr-3">Booking</th>
                  <th className="py-2 pr-3">Rider</th>
                  <th className="py-2 pr-3">Bike</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-[#163a2c] text-white">
                    <td className="py-2 pr-3">{b.booking_ref}</td>
                    <td className="py-2 pr-3">{b.users?.name ?? b.users?.phone ?? '—'}</td>
                    <td className="py-2 pr-3">{b.bikes?.name ?? '—'}</td>
                    <td className="py-2 pr-3 capitalize">{b.status}</td>
                    <td className="py-2 pr-3">₹{b.total_paid.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
