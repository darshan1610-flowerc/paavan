'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface LiveStock {
  availableUnits: number;
  isActive: boolean;
}

// Bikes are matched by name (not id) — the public site's hardcoded
// BIKES array uses slug-style ids ("hero-sprint") that have no
// relationship to the bikes table's UUID primary keys, but the admin
// creates rows with the same display name shown on the card.
export function useBikeStock() {
  const [stockByName, setStockByName] = useState<Record<string, LiveStock>>({});

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return; // no Supabase project configured yet — keep the hardcoded fallback data
    }

    const supabase = createClient();
    let active = true;

    const applyRows = (rows: { name: string; available_units: number; is_active: boolean }[]) => {
      if (!active) return;
      setStockByName(
        Object.fromEntries(rows.map((r) => [r.name, { availableUnits: r.available_units, isActive: r.is_active }]))
      );
    };

    supabase
      .from('bikes')
      .select('name, available_units, is_active')
      .then(({ data }) => applyRows(data ?? []));

    const channel = supabase
      .channel('public:bikes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bikes' },
        () => {
          supabase
            .from('bikes')
            .select('name, available_units, is_active')
            .then(({ data }) => applyRows(data ?? []));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return stockByName;
}
