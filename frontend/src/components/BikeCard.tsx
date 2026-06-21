'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';

interface BikeCardProps {
  id: string;
  name: string;
  description?: string;
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
  description,
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
      className={`bike-card rounded-2xl overflow-hidden transition-shadow duration-200 ${
        inStock
          ? 'bg-white border border-[#cce0cc] shadow-[0_2px_10px_rgba(0,0,0,0.05)] cursor-pointer hover:shadow-[0_8px_30px_rgba(15,110,86,0.12)] hover:border-[#0F6E56]'
          : 'bg-[#f5f5f5] border border-[#d0d0d0] shadow-[0_2px_6px_rgba(0,0,0,0.04)] cursor-pointer'
      }`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image */}
      <div className="aspect-[8/5] flex items-center justify-center relative overflow-hidden"
        style={{ background: inStock ? '#F4FAF1' : '#e8e8e8' }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={imageUrl}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              filter: inStock ? 'none' : 'grayscale(100%)',
              opacity: inStock ? 1 : 0.55,
            }}
          />
        ) : (
          <BikeSVG color={inStock ? accentColor : '#a0a0a0'} />
        )}

        {/* Stock badge */}
        <span
          className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm ${
            inStock
              ? 'bg-[#b8e09a]/90 text-[#163a02]'
              : 'bg-black/70 text-white'
          }`}
        >
          {inStock ? `${units ?? 0} units left` : 'Out of stock'}
        </span>

        {/* Tag */}
        {tag && inStock && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0F6E56] text-white">
            {tag}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className={`text-[15px] font-bold mb-1 ${inStock ? 'text-[#04342C]' : 'text-[#555]'}`}>{name}</h3>
        {description && (
          <p className={`text-[11px] leading-[1.6] mb-2 ${inStock ? 'text-[#7a9080]' : 'text-[#999]'}`}>{description}</p>
        )}

        {inStock ? (
          <ul className="space-y-1 mb-3">
            {specs.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11.5px] text-[#5a7a6a] leading-[1.6]">
                <span className="text-[#1D9E75] mt-[2px] flex-shrink-0">✓</span>
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <>
            <ul className="space-y-1 mb-3">
              {specs.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11.5px] text-[#aaa] leading-[1.6]">
                  <span className="text-[#bbb] mt-[2px] flex-shrink-0">✓</span>
                  {s}
                </li>
              ))}
            </ul>
            <div className="bg-[#eeeeee] border border-[#d8d8d8] rounded-[8px] px-3 py-2.5 mb-3">
              <div className="text-[12px] font-bold text-[#444] mb-0.5">⏳ Currently unavailable</div>
              <div className="text-[11px] text-[#777] leading-relaxed">
                Register your interest for free — we'll notify you the moment it's back in stock.
              </div>
            </div>
          </>
        )}

        <button
          style={{
            width: '100%',
            marginTop: '4px',
            padding: '9px 0',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: '8px',
            border: inStock ? `1.5px solid ${accentColor}` : '1.5px solid #888',
            color: inStock ? accentColor : '#fff',
            background: inStock ? 'transparent' : '#555',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
          }}
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
        >
          {inStock ? 'Select this bike →' : 'Join waitlist →'}
        </button>
      </div>
    </div>
  );
}
