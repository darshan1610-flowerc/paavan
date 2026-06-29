'use client';

import { useCallback, useEffect, useState } from 'react';
import EditStockModal from '@/components/admin/inventory/EditStockModal';
import EditPricingModal from '@/components/admin/inventory/EditPricingModal';
import AddBikeModal from '@/components/admin/inventory/AddBikeModal';

interface Bike {
  id: string;
  name: string;
  total_units: number;
  available_units: number;
  on_rent: number;
  in_repair: number;
  is_active: boolean;
  price_per_day: number;
  price_per_week: number;
  price_per_month: number;
}

export default function InventoryPage() {
  const [bikes, setBikes] = useState<Bike[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Bike | null>(null);
  const [editingPricing, setEditingPricing] = useState<Bike | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch('/api/admin/inventory')
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Failed to load inventory');
        setBikes(body.bikes);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (id: string, path: 'damage' | 'repair') => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/inventory/${id}/${path}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Action failed');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = async (bike: Bike) => {
    setBusyId(bike.id);
    try {
      const res = await fetch(`/api/admin/inventory/${bike.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !bike.is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[24px] text-white">Inventory</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-[13px] font-bold bg-[#0F6E56] text-white rounded-[8px] hover:bg-[#085041]"
        >
          + Add bike model
        </button>
      </div>

      {error && <p className="text-[13px] text-[#f5b0b0] mb-4">{error}</p>}

      {!bikes ? (
        <p className="text-[13px] text-[#9fd8bc]">Loading...</p>
      ) : bikes.length === 0 ? (
        <p className="text-[13px] text-[#9fd8bc]">No bike models yet — add one to get started.</p>
      ) : (
        <div className="bg-[#0d2a20] border border-[#163a2c] rounded-[10px] overflow-x-auto">
          <table className="w-full text-[12px] min-w-[900px]">
            <thead>
              <tr className="text-[#9fd8bc] text-left border-b border-[#163a2c]">
                <th className="py-3 px-4">Bike name</th>
                <th className="py-3 px-4">Daily</th>
                <th className="py-3 px-4">Weekly</th>
                <th className="py-3 px-4">Monthly</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">In stock</th>
                <th className="py-3 px-4">On rent</th>
                <th className="py-3 px-4">In repair</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bikes.map((bike) => (
                <tr key={bike.id} className="border-b border-[#163a2c] text-white">
                  <td className="py-3 px-4 font-semibold">{bike.name}</td>
                  <td className="py-3 px-4 text-[#9fd8bc]">
                    {bike.price_per_day > 0 ? `₹${bike.price_per_day.toLocaleString('en-IN')}` : <span className="text-[#f5b0b0]">—</span>}
                  </td>
                  <td className="py-3 px-4 text-[#9fd8bc]">
                    {bike.price_per_week > 0 ? `₹${bike.price_per_week.toLocaleString('en-IN')}` : <span className="text-[#f5b0b0]">—</span>}
                  </td>
                  <td className="py-3 px-4 text-[#9fd8bc]">
                    {bike.price_per_month > 0 ? `₹${bike.price_per_month.toLocaleString('en-IN')}` : <span className="text-[#f5b0b0]">—</span>}
                  </td>
                  <td className="py-3 px-4">{bike.total_units}</td>
                  <td className="py-3 px-4">{bike.available_units}</td>
                  <td className="py-3 px-4">{bike.on_rent}</td>
                  <td className="py-3 px-4">{bike.in_repair}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        !bike.is_active
                          ? 'bg-[#3a1414] text-[#f5b0b0]'
                          : bike.available_units === 0
                          ? 'bg-[#3a2e14] text-[#f5d6a8]'
                          : 'bg-[#163a2c] text-[#7adbb4]'
                      }`}
                    >
                      {!bike.is_active ? 'Deactivated' : bike.available_units === 0 ? 'Out of stock' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setEditingPricing(bike)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#7adbb4] border border-[#0F6E56] rounded-[6px] hover:bg-[#163a2c]"
                      >
                        Edit pricing
                      </button>
                      <button
                        onClick={() => setEditing(bike)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#9fd8bc] border border-[#1f4a38] rounded-[6px] hover:bg-[#163a2c]"
                      >
                        Edit stock
                      </button>
                      <button
                        onClick={() => runAction(bike.id, 'damage')}
                        disabled={busyId === bike.id}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#f5d6a8] border border-[#3a2e14] rounded-[6px] hover:bg-[#3a2e14] disabled:opacity-50"
                      >
                        Report damage
                      </button>
                      <button
                        onClick={() => runAction(bike.id, 'repair')}
                        disabled={busyId === bike.id}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#7adbb4] border border-[#1f4a38] rounded-[6px] hover:bg-[#163a2c] disabled:opacity-50"
                      >
                        Mark repaired
                      </button>
                      <button
                        onClick={() => toggleActive(bike)}
                        disabled={busyId === bike.id}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#f5b0b0] border border-[#3a1414] rounded-[6px] hover:bg-[#3a1414] disabled:opacity-50"
                      >
                        {bike.is_active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditStockModal
          bikeId={editing.id}
          bikeName={editing.name}
          currentAvailable={editing.available_units}
          totalUnits={editing.total_units}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {editingPricing && (
        <EditPricingModal
          bikeId={editingPricing.id}
          bikeName={editingPricing.name}
          currentPricePerDay={editingPricing.price_per_day}
          currentPricePerWeek={editingPricing.price_per_week}
          currentPricePerMonth={editingPricing.price_per_month}
          onClose={() => setEditingPricing(null)}
          onSaved={() => {
            setEditingPricing(null);
            load();
          }}
        />
      )}

      {showAdd && (
        <AddBikeModal
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </div>
  );
}
