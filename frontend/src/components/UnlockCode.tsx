'use client';

import { useEffect, useState } from 'react';

interface UnlockCodeProps {
  code?: string;
}

export default function UnlockCode({ code = '7394' }: UnlockCodeProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTimeLeft(`${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-[#04342C] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div className="text-[10px] text-[#9fd8bc] tracking-[0.8px] font-bold mb-2 uppercase">
          Today's Unlock Code
        </div>
        <div className="text-[40px] font-bold tracking-[12px] text-[#7adbb4] leading-none font-mono select-all">
          {code}
        </div>
        <div className="text-[10px] text-[#e0a888] mt-2 font-semibold">
          ⚠ Personal — do not share with anyone
        </div>
      </div>
      <div className="text-right text-[11px] text-[#6aaa88] flex-shrink-0">
        <div>Refreshes at midnight</div>
        {timeLeft && (
          <div className="text-[#9fd8bc] font-semibold mt-1 text-[13px]">{timeLeft}</div>
        )}
        <div className="mt-1 text-[10px] text-[#456a56]">remaining today</div>
      </div>
    </div>
  );
}
