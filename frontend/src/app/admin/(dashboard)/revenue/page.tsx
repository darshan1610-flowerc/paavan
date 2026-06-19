'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface MonthRow {
  month: string;
  students: number;
  delivery: number;
  totalRental: number;
  depositsCollected: number;
  depositsRefunded: number;
  depositsWithheld: number;
  netRevenue: number;
  bikesUtilised: number;
}

function toCsv(rows: MonthRow[]) {
  const header = ['Month', 'Students', 'Delivery', 'Total rental', 'Deposits collected', 'Deposits refunded', 'Deposits withheld', 'Net revenue', 'Bikes utilised'];
  const lines = rows.map((r) =>
    [r.month, r.students, r.delivery, r.totalRental, r.depositsCollected, r.depositsRefunded, r.depositsWithheld, r.netRevenue, r.bikesUtilised].join(',')
  );
  return [header.join(','), ...lines].join('\n');
}

export default function RevenuePage() {
  const [monthly, setMonthly] = useState<MonthRow[] | null>(null);
  const [summary, setSummary] = useState<MonthRow | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/revenue')
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Failed to load revenue');
        setMonthly(body.monthly);
        setSummary(body.summary);
      })
      .catch((e) => setError(e.message));
  }, []);

  const handleExport = () => {
    if (!monthly) return;
    const blob = new Blob([toCsv(monthly)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paavan-revenue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) return <p className="text-[13px] text-[#f5b0b0]">{error}</p>;
  if (!monthly || !summary) return <p className="text-[13px] text-[#9fd8bc]">Loading...</p>;

  const cards = [
    { label: 'Total rental revenue', value: summary.totalRental },
    { label: 'Student rentals', value: summary.students },
    { label: 'Delivery rentals', value: summary.delivery },
    { label: 'Deposits collected', value: summary.depositsCollected },
    { label: 'Deposits refunded', value: summary.depositsRefunded },
    { label: 'Deposits withheld', value: summary.depositsWithheld },
    { label: 'Net revenue', value: summary.netRevenue, highlight: true },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-[24px] text-white">Revenue tracker</h1>
        <button onClick={handleExport} className="px-4 py-2 text-[13px] font-bold bg-[#0F6E56] text-white rounded-[8px] hover:bg-[#085041]">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#0d2a20] border border-[#163a2c] rounded-[10px] p-4">
            <div className={`text-[18px] font-bold ${c.highlight ? 'text-[#7adbb4]' : 'text-white'}`}>
              ₹{c.value.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#9fd8bc] mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0d2a20] border border-[#163a2c] rounded-[10px] p-5 mb-6">
        <h2 className="text-[14px] font-bold text-white mb-4">Monthly revenue</h2>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#163a2c" />
              <XAxis dataKey="month" stroke="#9fd8bc" fontSize={11} />
              <YAxis stroke="#9fd8bc" fontSize={11} />
              <Tooltip
                contentStyle={{ background: '#0d2a20', border: '1px solid #163a2c', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="netRevenue" fill="#0F6E56" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0d2a20] border border-[#163a2c] rounded-[10px] overflow-x-auto">
        <table className="w-full text-[12px] min-w-[760px]">
          <thead>
            <tr className="text-[#9fd8bc] text-left border-b border-[#163a2c]">
              <th className="py-3 px-4">Month</th>
              <th className="py-3 px-4">Students</th>
              <th className="py-3 px-4">Delivery</th>
              <th className="py-3 px-4">Total rental</th>
              <th className="py-3 px-4">Deposits net</th>
              <th className="py-3 px-4">Revenue</th>
              <th className="py-3 px-4">Bikes utilised</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map((m) => (
              <tr key={m.month} className="border-b border-[#163a2c] text-white">
                <td className="py-3 px-4">{m.month}</td>
                <td className="py-3 px-4">₹{m.students.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4">₹{m.delivery.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4">₹{m.totalRental.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4">₹{(m.depositsCollected - m.depositsRefunded - m.depositsWithheld).toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 font-semibold text-[#7adbb4]">₹{m.netRevenue.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4">{m.bikesUtilised}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
