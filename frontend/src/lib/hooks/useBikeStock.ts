'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface LiveStock {
  supabaseId: string;
  availableUnits: number;
  isActive: boolean;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
}

export function useBikeStock() {
  const [stockByName, setStockByName] = useState<Record<string, LiveStock>>({});

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }

    const supabase = createClient();
    let active = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyRows = (rows: any[]) => {
      if (!active) return;
      setStockByName(
        Object.fromEntries(
          rows.map((r) => [
            String(r.name),
            {
              supabaseId: String(r.id ?? ''),
              availableUnits: Number(r.available_units ?? 0),
              isActive: Boolean(r.is_active ?? true),
              pricePerDay: Number(r.price_per_day ?? 0),
              pricePerWeek: Number(r.price_per_week ?? 0),
              pricePerMonth: Number(r.price_per_month ?? 0),
            },
          ])
        )
      );
    };

    const fetch = () =>
      supabase
        .from('bikes')
        .select('*')
        .then(({ data, error }) => {
          if (!error) applyRows(data ?? []);
        });

    fetch();

    const channel = supabase
      .channel('public:bikes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bikes' }, fetch)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return stockByName;
}
