'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const bullets = [
  { value: '10–15 min', label: 'journeys that used to take 55–60 min' },
  { value: '₹39/day', label: 'vs ₹2,000+ monthly on autos and cabs' },
  { value: '75% ROI', label: 'per bike per year · break-even in 18 months' },
  { value: '30+ bikes', label: 'deployed on IIT Bombay campus right now' },
];

export default function VideoShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('.showcase-left', {
        x: -60, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });
      gsap.from('.showcase-right', {
        x: 60, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="bg-[#04342C] py-14 sm:py-20 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-[1000px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-12">

        {/* Left: content */}
        <div className="showcase-left flex-1 w-full">
          <div className="text-[11px] text-[#5db88a] tracking-[1px] uppercase font-semibold mb-3">
            See it in action
          </div>
          <h2 className="font-display text-[28px] sm:text-[38px] text-white leading-[1.2] mb-4">
            See PAAVAN
            <br />
            <em className="italic text-[#7adbb4]">in action</em>
          </h2>
          <p className="text-[13px] sm:text-[14px] text-[#9fd8bc] leading-[1.75] mb-7 sm:mb-8 max-w-[400px]">
            Our e-bikes aren't just fast — they're built for the campus life. Removable battery,
            smart lock, daily code, and a team that actually cares.
          </p>

          <div className="space-y-3 sm:space-y-4 mb-7 sm:mb-8">
            {bullets.map((b) => (
              <div key={b.value} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-[#0F6E56] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <span className="text-white font-bold text-[13px] sm:text-[14px]">{b.value}</span>
                  <span className="text-[#9fd8bc] text-[12px] sm:text-[13px] ml-2">{b.label}</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/bikes"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 bg-[#0F6E56] text-white text-[13px] sm:text-[14px] font-bold rounded-[8px] hover:bg-[#1D9E75] active:scale-95 transition-all duration-150 shadow-[0_4px_14px_rgba(15,110,86,0.4)]"
          >
            Browse our bikes →
          </Link>
        </div>

        {/* Right: video */}
        <div className="showcase-right flex-1 w-full min-w-0">
          <div className="rounded-2xl overflow-hidden video-glow">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full object-cover aspect-video"
              aria-hidden="true"
              onLoadedMetadata={(e) => { e.currentTarget.currentTime = 2; }}
            >
              <source src="/videos/showcase.mp4" type="video/mp4" />
            </video>
          </div>
          <p className="text-[11px] text-[#456a56] text-center mt-3">
            Live footage from IIT Bombay campus
          </p>
        </div>
      </div>
    </section>
  );
}
