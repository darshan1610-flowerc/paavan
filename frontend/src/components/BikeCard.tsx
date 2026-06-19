'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';

interface BikeCardProps {
  id: string;
  name: string;
  tag?: string;
  specs: string[];
  inStock: boolean;
  units?: number;
  accentColor?: string;
  imageUrl?: string;
  onSelect: () => void;
  onWaitlist: () => void;
}

function BikeSVG({ color }: { color: string }) {
  return (
    <svg width="96" height="68" viewBox="0 0 92 66">
      <circle cx="21" cy="48" r="14" fill="none" stroke={color} strokeWidth="3" />
      <circle cx="71" cy="48" r="14" fill="none" stroke={color} strokeWidth="3" />
      <circle cx="21" cy="48" r="4" fill={color} />
      <circle cx="71" cy="48" r="4" fill={color} />
      <polyline points="21,48 35,21 51,21 63,33 71,33 71,48" fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <polyline points="35,21 29,33 21,33 21,48" fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="51" y1="21" x2="51" y2="12" stroke={color} strokeWidth="2.5" />
      <line x1="45" y1="12" x2="57" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="37" y="32" width="14" height="7" rx="3" fill={color} opacity="0.8" />
    </svg>
  );
}

export default function BikeCard({
  name,
  tag,
  specs,
  inStock,
  units,
  accentColor = '#0F6E56',
  imageUrl,
  onSelect,
  onWaitlist,
}: BikeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseEnter = () => {
    if (!inStock) return;
    gsap.to(cardRef.current, { y: -6, duration: 0.25, ease: 'power2.out' });
    if (imgRef.current) {
      gsap.to(imgRef.current, { scale: 1.04, duration: 0.35, ease: 'power2.out' });
    }
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { y: 0, duration: 0.25, ease: 'power2.out' });
    if (imgRef.current) {
      gsap.to(imgRef.current, { scale: 1, duration: 0.35, ease: 'power2.out' });
    }
  };

  const handleClick = () => {
    if (!inStock) {
      onWaitlist();
      return;
    }
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.97, duration: 0.08, ease: 'power2.in',
        onComplete: () => gsap.to(cardRef.current, { scale: 1, duration: 0.12, ease: 'power2.out' }),
      });
    }
    // Call onSelect immediately — not in GSAP onComplete chain
    onSelect();
  };

  return (
    <div
      ref={cardRef}
      className={`bike-card bg-white border rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-shadow duration-200 ${
        inStock
          ? 'border-[#cce0cc] cursor-pointer hover:shadow-[0_8px_30px_rgba(15,110,86,0.12)] hover:border-[#0F6E56]'
          : 'border-[#e0e0e0] opacity-60 cursor-pointer'
      }`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image */}
      <div className="aspect-[8/5] bg-[#F4FAF1] flex items-center justify-center relative overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={imageUrl}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          />
        ) : (
          <BikeSVG color={inStock ? accentColor : '#a0a0a0'} />
        )}

        {/* Stock badge */}
        <span
          className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm ${
            inStock
              ? 'bg-[#b8e09a]/90 text-[#163a02]'
              : 'bg-[#f5b0b0]/90 text-[#520f0f]'
          }`}
        >
          {inStock ? `${units ?? 0} units left` : 'Out of stock'}
        </span>

        {/* Optional tag (e.g. "Most Popular") */}
        {tag && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0F6E56] text-white">
            {tag}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-[15px] font-bold text-[#04342C] mb-2">{name}</h3>

        <ul className="space-y-1 mb-3">
          {specs.map((s, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11.5px] text-[#5a7a6a] leading-[1.6]">
              <span className="text-[#1D9E75] mt-[2px] flex-shrink-0">✓</span>
              {s}
            </li>
          ))}
        </ul>

        {!inStock && (
          <div className="text-[11px] text-[#854F0B] mb-2 font-semibold">
            🔧 Back in approximately 10 days
          </div>
        )}

        <button
          style={{
            width: '100%',
            marginTop: '4px',
            padding: '8px 0',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: '8px',
            border: `1.5px solid ${inStock ? accentColor : '#ccc'}`,
            color: inStock ? accentColor : '#888',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
        >
          {inStock ? 'Select this bike →' : 'Join waitlist →'}
        </button>
      </div>
    </div>
  );
}
