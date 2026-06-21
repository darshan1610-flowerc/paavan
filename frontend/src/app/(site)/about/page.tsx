'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Footer from '@/components/Footer';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const team = [
  { name: 'Param Tank', role: 'Chief Executive Officer', dept: 'B.Tech. Mechanical Engg. · IIT Bombay', initial: 'PT', color: '#0F6E56' },
  { name: 'Param Pabari', role: 'Chief Financial Officer', dept: 'B.Tech. Mechanical Engg. · IIT Bombay', initial: 'PP', color: '#085041' },
  { name: 'Dhruv Goyal', role: 'Operations & Logistics', dept: 'B.Tech. Mechanical Engg. · IIT Bombay', initial: 'DG', color: '#1D9E75' },
];

const traction = [
  { value: '30+', label: 'E-Bikes deployed at IIT Bombay' },
  { value: '₹2.7L', label: 'Direct sales till date' },
  { value: '100+', label: 'Delivery partners interviewed' },
  { value: '50+', label: 'Associates ready to rent' },
];

const advantages = [
  { icon: '🏫', title: 'Closed-campus control', desc: 'Low vandalism, predictable ops — unlike city-scale deployments.' },
  { icon: '🤝', title: 'Institutional partnerships', desc: 'Direct campus tie-ups guarantee demand before a single bike rolls.' },
  { icon: '🔋', title: 'Modular battery', desc: 'No charging infra cost. Students charge in their rooms in 1–2 hours.' },
  { icon: '🔧', title: 'In-house assembly', desc: '₹13,600 base cost per unit. 75% ROI per year, break-even in 18 months.' },
  { icon: '🎓', title: 'Student-run', desc: 'Built by IIT Bombay Mech students who live the commute problem daily.' },
];

const roadmap = [
  { quarter: 'Q3 2025', title: 'Deploy 30 E-Bikes at IIT Bombay', done: true },
  { quarter: 'Q4 2025', title: 'MVP for Last Mile Delivery Partners (150 km range)', done: true },
  { quarter: 'Q2 2026', title: 'Deploy 15 Last Mile Delivery Partner E-Bikes', done: false },
  { quarter: 'Q4 2026', title: 'Expand to IIT KGP, IIT Madras, IIT Kanpur', done: false },
  { quarter: 'Q1 2027', title: 'Partner with gated communities > 500 acres', done: false },
  { quarter: 'Q2 2027', title: 'Rent out ~500 E-Bikes across India', done: false },
];

const steps = [
  'Browse available bike models on our platform',
  'Select a rental plan — day, weekly, or monthly',
  'Verify your phone number via OTP',
  'Fill your details and upload Aadhaar card',
  'Pay via UPI, card, or net banking',
  'Return the bike to the shop with a short condition video — deposit refunded in 24 hrs',
];

export default function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('.about-hero-text', {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12,
      });

      gsap.from('.team-card', {
        y: 50, opacity: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.team-card', start: 'top 85%' },
      });

      gsap.from('.traction-stat', {
        scale: 0.85, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '.traction-stat', start: 'top 85%' },
      });

      gsap.from('.adv-item', {
        x: -30, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: '.adv-item', start: 'top 88%' },
      });

      gsap.from('.roadmap-item', {
        y: 30, opacity: 0, stagger: 0.12, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: '.roadmap-item', start: 'top 88%' },
      });

      gsap.from('.step-item', {
        x: 20, opacity: 0, stagger: 0.09, duration: 0.55, ease: 'power2.out',
        scrollTrigger: { trigger: '.step-item', start: 'top 88%' },
      });
    },
    { scope: pageRef }
  );

  return (
    <main ref={pageRef} className="min-h-screen">

      {/* Hero banner */}
      <div className="bg-[#04342C] py-16 px-6 text-center">
        <div className="max-w-[620px] mx-auto">
          <div className="about-hero-text text-[11px] text-[#5db88a] tracking-[1px] uppercase font-semibold mb-3">
            IIT Bombay · Campus Micromobility
          </div>
          <h1 className="about-hero-text font-display text-[28px] sm:text-[38px] text-white leading-[1.15] mb-4">
            Redefining urban mobility<br />
            <em className="italic text-[#7adbb4]">with smart E-Bikes</em>
          </h1>
          <p className="about-hero-text text-[13px] sm:text-[14px] text-[#9fd8bc] leading-[1.8] max-w-[480px] mx-auto">
            PAAVAN doesn&apos;t just move students faster — it gives them back <strong className="text-white">time</strong>.
            What used to take 55–60 minutes now takes just 10–15.
          </p>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 py-14 space-y-14">

        {/* Team */}
        <div>
          <div className="text-[11px] text-[#1D9E75] tracking-[1px] uppercase font-semibold mb-2">The team</div>
          <h2 className="font-display text-[26px] text-[#04342C] mb-6">Built by IIT Bombay students</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {team.map((m) => (
              <div key={m.name} className="team-card bg-white border border-[#cce0cc] rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-[16px] mx-auto mb-4"
                  style={{ background: m.color }}
                >
                  {m.initial}
                </div>
                <div className="text-[15px] font-bold text-[#04342C]">{m.name}</div>
                <div className="text-[12px] font-semibold text-[#0F6E56] mt-1">{m.role}</div>
                <div className="text-[11px] text-[#7a9080] mt-1.5 leading-snug">{m.dept}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Problem */}
        <div className="bg-[#F4FAF1] rounded-2xl p-7 border border-[#d4ecd4]">
          <div className="text-[11px] text-[#1D9E75] tracking-[1px] uppercase font-semibold mb-2">The problem</div>
          <h2 className="font-display text-[22px] text-[#04342C] mb-3">A broken last-mile system on campus</h2>
          <p className="text-[13px] text-[#4a6054] leading-[1.9] mb-5">
            <strong>80% of IIT Bombay students</strong> walk or cycle 5–6 km every day, losing
            7–8 hours every week just commuting. Autos are expensive and unreliable.
            E-buggies are scarce and overcrowded. There&apos;s no on-demand, dependable campus mobility.
            Campuses have demand density but zero last-mile infrastructure.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {traction.map(({ value, label }) => (
              <div key={value} className="traction-stat bg-white rounded-xl p-4 border border-[#cce0cc] text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="text-[22px] font-bold text-[#0F6E56]">{value}</div>
                <div className="text-[11px] text-[#5a7a6a] mt-1 leading-snug">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why PAAVAN wins */}
        <div>
          <div className="text-[11px] text-[#1D9E75] tracking-[1px] uppercase font-semibold mb-2">Our edge</div>
          <h2 className="font-display text-[22px] text-[#04342C] mb-5">Why PAAVAN succeeds where others failed</h2>
          <div className="space-y-3">
            {advantages.map((a) => (
              <div key={a.title} className="adv-item flex items-start gap-4 bg-white border border-[#cce0cc] rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <span className="text-[22px] mt-0.5">{a.icon}</span>
                <div>
                  <div className="text-[14px] font-bold text-[#04342C]">{a.title}</div>
                  <div className="text-[12.5px] text-[#4a6054] mt-0.5 leading-snug">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div>
          <div className="text-[11px] text-[#1D9E75] tracking-[1px] uppercase font-semibold mb-2">Roadmap</div>
          <h2 className="font-display text-[22px] text-[#04342C] mb-6">Building credibility before city-scale</h2>
          <div className="relative pl-6 border-l-2 border-[#cce0cc] space-y-5">
            {roadmap.map((r) => (
              <div key={r.quarter} className="roadmap-item relative">
                <div
                  className={`absolute -left-[25px] w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                    r.done
                      ? 'bg-[#0F6E56] border-[#0F6E56] text-white'
                      : 'bg-white border-[#b8d8c8] text-[#9ab0a0]'
                  }`}
                >
                  {r.done ? '✓' : ''}
                </div>
                <div className={`ml-2 p-4 rounded-xl border ${r.done ? 'bg-[#EAF3DE] border-[#b8d898]' : 'bg-white border-[#e4ece4]'}`}>
                  <div className={`text-[11px] font-bold tracking-wider uppercase mb-0.5 ${r.done ? 'text-[#0F6E56]' : 'text-[#9ab0a0]'}`}>
                    {r.quarter} {r.done && '· Completed'}
                  </div>
                  <div className={`text-[13px] font-semibold ${r.done ? 'text-[#04342C]' : 'text-[#5a7a6a]'}`}>{r.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-[#F4FAF1] rounded-2xl p-7 border border-[#d4ecd4]">
          <div className="text-[11px] text-[#1D9E75] tracking-[1px] uppercase font-semibold mb-2">Process</div>
          <h2 className="font-display text-[22px] text-[#04342C] mb-5">How it works</h2>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="step-item flex items-start gap-3 text-[13px] text-[#3d5a45]">
                <span className="w-6 h-6 bg-[#0F6E56] rounded-full text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <Link
          href="/bikes"
          className="inline-block px-7 py-3.5 bg-[#0F6E56] text-white text-[14px] font-bold rounded-[8px] hover:bg-[#085041] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(15,110,86,0.28)]"
        >
          Browse bikes →
        </Link>
      </div>

      <Footer />
    </main>
  );
}
