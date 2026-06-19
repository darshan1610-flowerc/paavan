'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import StepIndicator from '@/components/StepIndicator';
import PlanCard from '@/components/PlanCard';
import Footer from '@/components/Footer';

gsap.registerPlugin(useGSAP);

const STEPS = [
  { label: 'Select bike' },
  { label: 'Choose plan' },
  { label: 'Details' },
  { label: 'Payment' },
];

const PRICING_HIGHLIGHTS = [
  {
    perDay: 39,
    label: 'per month',
    price: '₹1,199',
    period: 'monthly',
    tag: 'Best value',
    tagColor: '#b8e09a',
    tagText: '#163a02',
  },
  {
    perDay: 69,
    label: 'per week',
    price: '₹489',
    period: 'weekly',
    tag: 'Short-term',
    tagColor: 'rgba(255,255,255,0.15)',
    tagText: '#a8dfc4',
  },
  {
    perDay: 99,
    label: 'per day',
    price: '₹99',
    period: 'day pass',
    tag: 'Try it out',
    tagColor: 'rgba(255,255,255,0.15)',
    tagText: '#a8dfc4',
  },
];

const PLANS = [
  {
    id: 'day',
    name: 'Day pass',
    price: 99,
    unit: 'day',
    duration: '1 day',
    tag: 'Students',
    tagVariant: 'student' as const,
    features: ['1 day rental', 'Standard bike', 'Daily unlock code', 'Helmet included', '+ ₹1,000 deposit'],
  },
  {
    id: 'weekly',
    name: 'Weekly',
    price: 489,
    unit: 'week',
    duration: '7 days',
    tag: 'Students',
    tagVariant: 'student' as const,
    dailyRate: 69,
    features: ['7 days rental', '₹69/day effective', 'Standard support', 'Helmet included', '+ ₹1,000 deposit'],
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 1199,
    unit: 'month',
    duration: '30 days',
    tag: 'Students',
    tagVariant: 'student' as const,
    popular: true,
    dailyRate: 39,
    features: ['30 days rental', '₹39/day effective', 'Priority support', 'Free helmet + lock', '+ ₹1,000 deposit'],
  },
  {
    id: 'delivery',
    name: 'Delivery plan',
    price: 2999,
    unit: 'month',
    duration: '30 days',
    tag: 'Delivery partners',
    tagVariant: 'delivery' as const,
    features: ['100km+ range', 'Heavy-duty usage', 'Storage box included', 'Dedicated support', '+ ₹1,000 deposit'],
  },
];

import { createClient } from '@/lib/supabase/client';

export default function PlansPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBike, setSelectedBike] = useState<{ name: string } | null>(null);
  const [plans, setPlans] = useState<any[]>(PLANS);

  useEffect(() => {
    const raw = localStorage.getItem('paavan_bike');
    if (raw) setSelectedBike(JSON.parse(raw));

    async function loadPlans() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('plans').select('*');
        if (data && data.length > 0) {
          const mapped = data.map(dbPlan => {
            const existing = PLANS.find(p => p.name.toLowerCase() === dbPlan.name.toLowerCase());
            return {
              id: dbPlan.id,
              name: dbPlan.name,
              price: dbPlan.price,
              unit: dbPlan.duration_days === 1 ? 'day' : dbPlan.duration_days === 7 ? 'week' : 'month',
              duration: dbPlan.duration_days === 1 ? '1 day' : `${dbPlan.duration_days} days`,
              tag: dbPlan.type === 'student' ? 'Students' : 'Delivery partners',
              tagVariant: dbPlan.type as any,
              dailyRate: Math.round(dbPlan.price / dbPlan.duration_days),
              features: Array.isArray(dbPlan.features) ? dbPlan.features : (existing?.features || []),
              popular: existing?.popular || false,
            };
          });
          setPlans(mapped);
        }
      } catch (err) {
        console.error('Error fetching plans from database:', err);
      }
    }
    loadPlans();
  }, []);

  useGSAP(
    () => {
      gsap.from('.pricing-eyebrow', {
        y: 16, opacity: 0, duration: 0.5, ease: 'power2.out', delay: 0.05,
      });
      gsap.from('.pricing-tagline', {
        y: 24, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.15,
      });
      gsap.from('.pricing-pill', {
        y: 36, opacity: 0, stagger: 0.1, duration: 0.65, ease: 'back.out(1.4)', delay: 0.25,
      });
      gsap.from('.plan-card', {
        y: 40, opacity: 0, stagger: 0.1, duration: 0.65, ease: 'power3.out', delay: 0.5,
      });
    },
    { scope: containerRef }
  );

  const handleSelectPlan = (plan: any) => {
    localStorage.setItem(
      'paavan_plan',
      JSON.stringify({ id: plan.id, name: plan.name, price: plan.price, duration: plan.duration })
    );
    router.push('/booking');
  };

  return (
    <main className="min-h-screen">
      <div ref={containerRef} className="max-w-[1000px] mx-auto px-6 py-10">
        <StepIndicator steps={STEPS} currentStep={2} />

        {/* Heading */}
        <div className="mb-7">
          <h1 className="font-display text-[30px] text-[#04342C]">Choose your plan</h1>
          <p className="text-[13px] text-[#5a7a6a] mt-1.5">
            {selectedBike ? (
              <>Booking for: <strong className="text-[#0F6E56]">{selectedBike.name}</strong> · </>
            ) : null}
            All plans include helmet, daily unlock code &amp; on-call campus maintenance
          </p>
        </div>

        {/* ── Pricing showcase ── */}
        <div className="bg-[#04342C] rounded-2xl overflow-hidden mb-8 shadow-[0_8px_40px_rgba(4,52,44,0.18)]">

          {/* Top banner */}
          <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-white/10">
            <div className="pricing-eyebrow text-[10px] font-bold tracking-[1.5px] uppercase text-[#5db88a] mb-2">
              Campus Commute — Simplified
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 sm:gap-2">
              <h2 className="pricing-tagline font-display text-[20px] sm:text-[26px] text-white leading-tight">
                E-Bikes for the students,{' '}
                <em className="italic text-[#7adbb4]">by the students</em>
              </h2>
              <div className="pricing-tagline text-[11px] text-[#6aaa88] shrink-0">
                +91 63512-43422 · @paavan_go_electric
              </div>
            </div>
          </div>

          {/* Three pricing pills — 1 col on mobile, 3 col on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-white/10 divide-y sm:divide-y-0">
            {PRICING_HIGHLIGHTS.map((p) => (
              <div key={p.perDay} className="pricing-pill px-5 py-5 sm:py-6 relative">
                {/* Mobile: horizontal row layout */}
                <div className="flex items-center justify-between sm:block">
                  {/* Left side on mobile / centered on desktop */}
                  <div className="sm:text-center">
                    {p.tag === 'Best value' && (
                      <div
                        className="inline-block sm:block sm:mx-auto mb-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
                        style={{ background: p.tagColor, color: p.tagText }}
                      >
                        {p.tag}
                      </div>
                    )}
                    <div className="flex items-start gap-0.5 sm:justify-center sm:mt-2">
                      <span className="text-[14px] sm:text-[18px] font-bold text-[#7adbb4] mt-1">₹</span>
                      <span className="text-[40px] sm:text-[52px] font-bold text-white leading-none">{p.perDay}</span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold tracking-[2px] uppercase text-[#5db88a]">
                      per day
                    </div>
                  </div>

                  {/* Right side on mobile / below on desktop */}
                  <div className="text-right sm:text-center sm:mt-3 sm:pt-3 sm:border-t sm:border-white/10">
                    <div className="text-[11px] sm:text-[13px] text-[#9fd8bc]">E-Bikes on rent at</div>
                    <div className="text-[15px] sm:text-[16px] font-bold text-white mt-0.5">
                      {p.price}
                      <span className="text-[11px] sm:text-[12px] font-normal text-[#6aaa88] ml-1">/{p.label.split(' ')[1]}</span>
                    </div>
                    <div className="text-[10px] text-[#456a56] capitalize">{p.period} plan</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="mb-3">
          <div className="text-[11px] text-[#1D9E75] font-semibold tracking-[1px] uppercase mb-4">
            Select a plan to continue →
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan) => (
              <PlanCard key={plan.id} {...plan} onSelect={() => handleSelectPlan(plan)} />
            ))}
          </div>
        </div>

        {/* Deposit callout */}
        <div className="mt-8 bg-[#EAF3DE] border border-[#b8d898] rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-[#0F6E56] rounded-[9px] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 stroke-white fill-none" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              </svg>
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#04342C] mb-1">₹1,000 refundable deposit — always</div>
              <div className="text-[12px] text-[#4a6a40] leading-relaxed">
                Every plan includes a ₹1,000 security deposit. Return your bike with a short condition
                video and get 100% refunded within 24 hours, guaranteed.
              </div>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}
