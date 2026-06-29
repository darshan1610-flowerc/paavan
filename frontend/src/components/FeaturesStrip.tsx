'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const features = [
  {
    icon: (
      <svg className="w-[26px] h-[26px] stroke-[#0F6E56] fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M5 18H3a2 2 0 01-2-2V8a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2 2h-2"/>
        <path d="M12 22V12M12 12l-3 3M12 12l3 3"/>
      </svg>
    ),
    title: 'Removable battery',
    subtitle: 'Charge in your hostel room',
    desc: 'Waterproof battery detaches in seconds. Charge it in your room in 1–2 hours. No charging station ever needed.',
    accent: '#EAF3DE',
  },
  {
    icon: (
      <svg className="w-[26px] h-[26px] stroke-[#0F6E56] fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    title: 'Daily unlock code',
    subtitle: 'Fresh code every midnight',
    desc: 'New 4-digit code resets every midnight. Key-based throttle protects against theft even if your code is seen.',
    accent: '#e0eeff',
  },
  {
    icon: (
      <svg className="w-[26px] h-[26px] stroke-[#0F6E56] fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    title: 'On-call maintenance',
    subtitle: 'Zero downtime guarantee',
    desc: 'Campus team on standby 7 days a week. Any issue, we fix it same day — your rental clock pauses while we do.',
    accent: '#fff0e0',
  },
  {
    icon: (
      <svg className="w-[26px] h-[26px] stroke-[#0F6E56] fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Save 7–8 hrs/week',
    subtitle: '10 min instead of 60',
    desc: '55–60 min journeys cut to 10–15 min with pedal assist up to 50 km/h. That\'s 30+ hours freed every month.',
    accent: '#EAF3DE',
  },
];

export default function FeaturesStrip() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);

  useGSAP(
    () => {
      gsap.from('.feat-eyebrow', {
        y: 20, opacity: 0, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
      gsap.from('.feat-title', {
        y: 40, opacity: 0, duration: 0.75, ease: 'power3.out', delay: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
      gsap.from('.feat-sub', {
        y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.22,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
      gsap.from('.feat-card', {
        rotationX: -65, opacity: 0, y: 20,
        transformOrigin: 'top center', transformPerspective: 900,
        duration: 0.85, stagger: 0.13, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '.feat-card', start: 'top 88%' },
      });
    },
    { scope: sectionRef }
  );

  const handleCardClick = (i: number) => {
    setTappedIndex(tappedIndex === i ? null : i);
  };

  return (
    <section ref={sectionRef} className="bg-white py-14 sm:py-20 px-4 sm:px-6">
      <div className="max-w-[1000px] mx-auto">

        <div className="text-center mb-10 sm:mb-14">
          <div className="feat-eyebrow inline-flex items-center gap-2 bg-[#EAF3DE] border border-[#b8d898] rounded-full px-5 py-2 text-[25px] text-[#0F6E56] tracking-[1px] uppercase font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-[#1D9E75] shrink-0" />
            Why PAAVAN
          </div>
          <h2 className="feat-title font-display text-[28px] sm:text-[34px] text-[#04342C] mb-3">
            Campus commute, <em className="italic text-[#0F6E56]">simplified</em>
          </h2>
          <p className="feat-sub text-[13px] sm:text-[14px] text-[#5a7a6a] max-w-[420px] mx-auto">
            E-bikes for students and delivery partners — built by IIT Bombay students
          </p>
          <p className="md:hidden text-[11px] text-[#9ab0a0] mt-2">Tap a card to read more</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`feat-card flip-card ${tappedIndex === i ? 'tapped' : ''}`}
              onClick={() => handleCardClick(i)}
            >
              <div className="flip-card-inner">

                {/* Front */}
                <div className="flip-card-front bg-[#F4FAF1] border border-[#dff0df] p-6 cursor-pointer">
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center mb-5"
                    style={{ background: f.accent }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-[15px] font-bold text-[#04342C] mb-2">{f.title}</h3>
                  <p className="text-[12px] font-semibold text-[#1D9E75] mb-8">{f.subtitle}</p>
                  <p className="hidden md:block text-[11px] text-[#b0c8b0] tracking-wide">Hover to read more →</p>
                  <p className="md:hidden text-[11px] text-[#b0c8b0] tracking-wide">Tap to read more →</p>
                </div>

                {/* Back */}
                <div className="flip-card-back bg-[#0F6E56] p-6 flex flex-col justify-center cursor-pointer">
                  <h3 className="text-[15px] font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-[13px] text-[#a8dfc4] leading-[1.8]">{f.desc}</p>
                  <p className="text-[11px] text-[#5db88a] mt-4 md:hidden">Tap to flip back ←</p>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
