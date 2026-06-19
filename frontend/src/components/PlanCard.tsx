'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';

interface PlanCardProps {
  id: string;
  name: string;
  price: number;
  unit: string;
  duration: string;
  tag: string;
  tagVariant?: 'student' | 'delivery';
  popular?: boolean;
  dailyRate?: number;
  features: string[];
  onSelect: () => void;
}

export default function PlanCard({
  name,
  price,
  unit,
  duration,
  tag,
  tagVariant = 'student',
  popular,
  dailyRate,
  features,
  onSelect,
}: PlanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.97,
        duration: 0.08,
        ease: 'power2.in',
        onComplete: () => {
          gsap.to(cardRef.current, { scale: 1, duration: 0.12, ease: 'power2.out' });
        },
      });
    }
    // Call onSelect immediately — don't put it in GSAP onComplete
    onSelect();
  };

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, { y: -4, duration: 0.2, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { y: 0, duration: 0.2, ease: 'power2.out' });
  };

  return (
    <div
      ref={cardRef}
      className={`plan-card flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer relative transition-shadow duration-200 ${
        popular
          ? 'border-2 border-[#0F6E56] shadow-[0_6px_28px_rgba(15,110,86,0.16)]'
          : 'border border-[#cce0cc] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_24px_rgba(15,110,86,0.10)]'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Popular ribbon */}
      {popular && (
        <div className="bg-[#0F6E56] text-white text-[10px] font-bold tracking-[1px] uppercase text-center py-1.5">
          ★ Most popular
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Tag */}
        <span
          className={`self-start inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-3 tracking-wide ${
            tagVariant === 'delivery'
              ? 'bg-[#e6f1fb] text-[#0c447c]'
              : 'bg-[#EAF3DE] text-[#085041]'
          }`}
        >
          {tag}
        </span>

        {/* Plan name + duration */}
        <div className="text-[16px] font-bold text-[#04342C]">{name}</div>
        <div className="text-[11px] text-[#8aaa90] mb-3">{duration}</div>

        {/* Price */}
        <div className="flex items-end gap-1 mb-0.5">
          <span className="text-[13px] font-bold text-[#0F6E56] mb-0.5">₹</span>
          <span className="text-[32px] font-bold text-[#0F6E56] leading-none">
            {price.toLocaleString('en-IN')}
          </span>
          <span className="text-[13px] text-[#9ab0a0] mb-0.5">/{unit}</span>
        </div>
        {dailyRate && (
          <div className="text-[11px] font-bold text-[#1D9E75] mb-3">= ₹{dailyRate}/day</div>
        )}

        {/* Features */}
        <div className="mt-2 mb-4 space-y-1.5 flex-1">
          {features.map((f) => (
            <div key={f} className="flex items-start gap-2 text-[12px] text-[#5a7a6a]">
              <svg className="w-3.5 h-3.5 stroke-[#0F6E56] fill-none shrink-0 mt-0.5" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {f}
            </div>
          ))}
        </div>

        {/* CTA — directly calls handleClick, no GSAP chain */}
        <button
          type="button"
          onClick={handleClick}
          className={`w-full py-3 text-[13px] font-bold rounded-[10px] transition-colors mt-auto ${
            popular
              ? 'bg-[#0F6E56] text-white hover:bg-[#085041] shadow-[0_2px_12px_rgba(15,110,86,0.28)]'
              : 'bg-[#EAF3DE] text-[#085041] hover:bg-[#d4ecc4] border border-[#b8d898]'
          }`}
        >
          Choose {name} →
        </button>
      </div>
    </div>
  );
}
