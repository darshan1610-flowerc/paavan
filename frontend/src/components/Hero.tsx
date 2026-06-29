'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const headline = [
  { word: 'Redefining', italic: false },
  { word: 'urban', italic: false },
  { word: 'mobility', italic: false },
  { word: 'with', italic: false },
  { word: 'smart', italic: true },
  { word: 'E-Bikes', italic: true, teal: true },
];

const stats = [
  { value: '60+', label: 'Bikes on campus' },
  { value: '₹39', label: 'Per day' },
  { value: '150km', label: 'Max range' },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-eyebrow', { y: 30, opacity: 0, duration: 0.7, delay: 0.3 })
        .from('.hero-word', { y: 40, opacity: 0, stagger: 0.08, duration: 0.7 }, '-=0.2')
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.6 }, '-=0.3')
        .from('.hero-btn', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, '-=0.3')
        .from('.hero-stat', { y: 30, opacity: 0, scale: 0.9, stagger: 0.1, duration: 0.6 }, '-=0.2');
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 overflow-hidden"
    >
      {/* Background video — #t=2 removed from src; onLoadedMetadata handles the skip */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
        onLoadedMetadata={(e) => { e.currentTarget.currentTime = 2; }}
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-[#04342C]/60" />

      {/* Radial accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(29,158,117,0.30)_0%,transparent_65%)]" />

      {/* Content */}
      <div className="relative z-10 max-w-[680px] mx-auto pt-16 sm:pt-20 pb-10">
        {/* Eyebrow */}
        <div className="hero-eyebrow inline-flex items-center gap-2 glass rounded-full px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] text-[#a8dfca] tracking-[0.9px] uppercase mb-5 sm:mb-6">
          <span className="w-1.5 h-1.5 bg-[#7adbb4] rounded-full shrink-0" />
          IIT Bombay · Campus Micromobility
        </div>

        {/* H1 */}
        <h1 className="font-display text-[32px] sm:text-[46px] md:text-[58px] leading-[1.12] mb-4 sm:mb-5 flex flex-wrap justify-center gap-x-2 sm:gap-x-3">
          {headline.map((w, i) => (
            <span
              key={i}
              className={`hero-word inline-block ${w.italic ? 'italic' : ''} ${
                w.teal ? 'text-[#7adbb4]' : 'text-white'
              }`}
            >
              {w.word}
            </span>
          ))}
        </h1>

        {/* Subtext */}
        <p className="hero-sub text-[14px] sm:text-[16px] text-[#9fd8bc] leading-[1.75] mb-6 max-w-[480px] mx-auto">
          What used to take 55–60 minutes now takes 10–15.
          <br />₹39/day. No license required. Removable battery.
        </p>

        {/* Primary CTA — right after "No license required" */}
        <Link
          href="/bikes"
          className="hero-btn inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#0F6E56] text-[15px] sm:text-[16px] font-bold rounded-[10px] hover:bg-[#e8f8f1] active:scale-95 transition-all duration-150 shadow-[0_6px_24px_rgba(0,0,0,0.18)] mb-4"
        >
          🚴 Rent now — just ₹39/day
        </Link>

        {/* Secondary links */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 sm:mb-12">
          <Link
            href="/bikes"
            className="hero-btn px-5 py-2.5 text-white border border-white/35 text-[13px] font-semibold rounded-[8px] hover:bg-white/10 active:scale-95 transition-all duration-150"
          >
            Browse bikes
          </Link>
          <Link
            href="/plans"
            className="hero-btn px-5 py-2.5 text-white border border-white/35 text-[13px] font-semibold rounded-[8px] hover:bg-white/10 active:scale-95 transition-all duration-150"
          >
            View plans →
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {stats.map((s) => (
            <div key={s.value} className="hero-stat glass rounded-xl px-3 sm:px-5 py-2 sm:py-3 text-center">
              <div className="text-[18px] sm:text-[22px] font-bold text-white leading-none">{s.value}</div>
              <div className="text-[9px] sm:text-[10px] text-[#9fd8bc] mt-1 tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#9fd8bc] opacity-60">
        <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        <svg className="w-4 h-4 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
