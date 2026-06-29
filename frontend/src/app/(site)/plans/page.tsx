'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import StepIndicator from '@/components/StepIndicator';
import PlanCard from '@/components/PlanCard';
import Footer from '@/components/Footer';
import { useBikeStock } from '@/lib/hooks/useBikeStock';

gsap.registerPlugin(useGSAP);

const STEPS = [
  { label: 'Select bike' },
  { label: 'Choose plan' },
  { label: 'Details' },
  { label: 'Payment' },
];

const BIKE_LIST = [
  { name: 'Hero Sprint',    accent: '#4a5a2a' },
  { name: 'Mach City',     accent: '#0F6E56' },
  { name: 'Geekay',        accent: '#1D9E75' },
  { name: 'Sturdy Austere',accent: '#085041' },
  { name: 'Raleigh',       accent: '#1a56db' },
  { name: 'Schnell',       accent: '#c0392b' },
  { name: 'Urban Terrain', accent: '#6d28d9' },
  { name: 'Hero Winn',     accent: '#0F6E56' },
  { name: 'Nebzee Black',  accent: '#1a1a1a' },
  { name: 'Nebzee Copper', accent: '#b45309' },
  { name: 'Axiro Blue',    accent: '#1e40af' },
  { name: 'Axiro Red',     accent: '#dc2626' },
];

function buildPlans(pricePerDay: number, pricePerWeek: number, pricePerMonth: number) {
  return [
    {
      id: 'daily',
      name: 'Day pass',
      price: pricePerDay,
      unit: 'day',
      duration: '1 day',
      tag: 'Students',
      tagVariant: 'student' as const,
      features: ['1 day rental', 'Daily unlock code', 'Helmet included', 'Standard support', '+ ₹1,000 deposit'],
    },
    {
      id: 'weekly',
      name: 'Weekly',
      price: pricePerWeek,
      unit: 'week',
      duration: '7 days',
      tag: 'Students',
      tagVariant: 'student' as const,
      dailyRate: Math.round(pricePerWeek / 7),
      features: ['7 days rental', `₹${Math.round(pricePerWeek / 7)}/day effective`, 'Standard support', 'Helmet included', '+ ₹1,000 deposit'],
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: pricePerMonth,
      unit: 'month',
      duration: '30 days',
      tag: 'Students',
      tagVariant: 'student' as const,
      popular: true,
      dailyRate: Math.round(pricePerMonth / 30),
      features: ['30 days rental', `₹${Math.round(pricePerMonth / 30)}/day effective`, 'Priority support', 'Free helmet + lock', '+ ₹1,000 deposit'],
    },
  ];
}

export default function PlansPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeBikeName, setActiveBikeName] = useState(BIKE_LIST[0].name);
  const liveStock = useBikeStock();

  useEffect(() => {
    const raw = localStorage.getItem('paavan_bike');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.name) setActiveBikeName(parsed.name);
    }
  }, []);

  useGSAP(
    () => {
      gsap.from('.plan-card', { y: 40, opacity: 0, stagger: 0.1, duration: 0.65, ease: 'power3.out', delay: 0.2 });
    },
    { scope: containerRef }
  );

  const switchBike = (name: string) => {
    const live = liveStock[name];
    setActiveBikeName(name);
    localStorage.setItem('paavan_bike', JSON.stringify({ id: live?.supabaseId ?? name, name }));
  };

  const bikeData = liveStock[activeBikeName];
  const hasPricing = bikeData && (bikeData.pricePerDay > 0 || bikeData.pricePerWeek > 0 || bikeData.pricePerMonth > 0);
  const plans = hasPricing
    ? buildPlans(bikeData.pricePerDay, bikeData.pricePerWeek, bikeData.pricePerMonth)
    : null;

  const handleSelectPlan = (plan: ReturnType<typeof buildPlans>[number]) => {
    localStorage.setItem(
      'paavan_plan',
      JSON.stringify({ id: plan.id, name: plan.name, price: plan.price, duration: plan.duration })
    );
    router.push('/booking');
  };

  return (
    <main className="min-h-screen">
      <div ref={containerRef} className="max-w-[900px] mx-auto px-6 py-10">
        <StepIndicator steps={STEPS} currentStep={2} />

        {/* Heading */}
        <div className="mb-5">
          <h1 className="font-display text-[30px] text-[#04342C]">Choose your plan</h1>
          <p className="text-[13px] text-[#5a7a6a] mt-1.5">
            Pricing for <strong className="text-[#0F6E56]">{activeBikeName}</strong> · All plans include helmet, daily unlock code &amp; on-call support
          </p>
        </div>

        {/* Bike switcher */}
        <div className="mb-8">
          <div className="text-[10px] font-bold text-[#9ab09a] tracking-wider uppercase mb-2.5">
            Switch bike to see different prices
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {BIKE_LIST.map((bike) => {
              const isActive = bike.name === activeBikeName;
              return (
                <button
                  key={bike.name}
                  onClick={() => switchBike(bike.name)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap flex-shrink-0 border transition-all ${
                    isActive
                      ? 'bg-[#04342C] text-white border-[#04342C] shadow-[0_2px_10px_rgba(4,52,44,0.2)]'
                      : 'bg-white text-[#04342C] border-[#cce0cc] hover:border-[#0F6E56] hover:bg-[#EAF3DE]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: bike.accent }} />
                  {bike.name}
                  {isActive && (
                    <svg className="w-3 h-3 stroke-white fill-none flex-shrink-0" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Plan cards */}
        <div className="mb-3">
          <div className="text-[11px] text-[#1D9E75] font-semibold tracking-[1px] uppercase mb-4">
            Select a plan to continue →
          </div>

          {plans ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {plans.map((plan) => (
                <PlanCard key={plan.id} {...plan} onSelect={() => handleSelectPlan(plan)} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 bg-[#f4faf1] rounded-2xl border border-[#cce0cc] animate-pulse" />
              ))}
            </div>
          )}

          {bikeData && !hasPricing && (
            <div className="mt-4 p-4 bg-[#FAEEDA] border border-[#f0c060] rounded-xl text-[12px] text-[#854F0B]">
              Pricing for <strong>{activeBikeName}</strong> hasn&apos;t been set yet. Go to Admin → Inventory → Edit pricing to configure it.
            </div>
          )}
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
