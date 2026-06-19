'use client';

import { useEffect, useState } from 'react';

function format(ms: number) {
  if (ms <= 0) return 'Closed';
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

export default function CountdownTimer({ closesAt }: { closesAt: string }) {
  const [remaining, setRemaining] = useState(() => new Date(closesAt).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(new Date(closesAt).getTime() - Date.now()), 30_000);
    return () => clearInterval(id);
  }, [closesAt]);

  const urgent = remaining < 4 * 60 * 60 * 1000;

  return (
    <span className={`font-bold ${urgent ? 'text-[#f5b0b0]' : 'text-[#7adbb4]'}`}>
      {format(remaining)}
    </span>
  );
}
