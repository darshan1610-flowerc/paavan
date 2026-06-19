'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Footer from '@/components/Footer';

gsap.registerPlugin(useGSAP);

interface ActiveRide {
  bike: string;
  plan: string;
  duration: string;
  total: number;
  name: string;
  startDate: string;
}

export default function SuccessPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ride, setRide] = useState<ActiveRide | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('paavan_active_ride');
    if (raw) setRide(JSON.parse(raw));
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.success-ring', { scale: 0, opacity: 0, duration: 0.6, delay: 0.2 })
        .from('.success-h', { y: 30, opacity: 0, duration: 0.6 }, '-=0.2')
        .from('.success-sub', { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.success-card', { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.success-note', { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.success-btn', { y: 20, opacity: 0, duration: 0.5 }, '-=0.2');
    },
    { scope: containerRef }
  );

  const bookingId = '#PVN-2406-' + String(Math.floor(Math.random() * 9000) + 1000);

  return (
    <main className="min-h-screen" ref={containerRef}>
      <div className="max-w-[520px] mx-auto px-6 py-16 text-center">
        <div className="text-[30px] tracking-wider mb-6">🎉 🚴 ✅</div>

        {/* Pulsing check ring */}
        <div className="success-ring w-24 h-24 bg-[#EAF3DE] rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ animation: 'pulse-ring 1.2s ease-in-out infinite alternate' }}>
          <svg className="w-12 h-12 stroke-[#0F6E56] fill-none" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="success-h font-display text-[34px] text-[#04342C] mb-2">
          Welcome to PAAVAN,
          <br />
          <em className="italic text-[#0F6E56]">{ride?.name?.split(' ')[0] ?? 'Rider'}!</em>
        </h1>

        <p className="success-sub text-[15px] text-[#7a9080] leading-[1.75] max-w-[420px] mx-auto mb-8">
          Your <strong className="text-[#04342C]">{ride?.bike}</strong> is booked for{' '}
          <strong className="text-[#04342C]">{ride?.duration}</strong>. Show this screen to our campus
          operator — they'll deliver your bike directly to you!
        </p>

        {/* Booking card */}
        <div className="success-card bg-white border border-[#cce0cc] rounded-xl p-6 text-left shadow-[0_4px_20px_rgba(15,110,86,0.08)] mb-6">
          {[
            { label: 'Booking ID', value: bookingId, highlight: true },
            { label: 'Bike', value: ride?.bike ?? '—' },
            { label: 'Plan', value: ride ? `${ride.plan} (${ride.duration})` : '—' },
            { label: 'Amount paid', value: ride ? `₹${ride.total.toLocaleString('en-IN')}` : '—' },
            { label: 'Deposit', value: '₹1,000 (refunded in 24hr on return)' },
            { label: 'Status', value: '✓ Confirmed', green: true },
          ].map(({ label, value, highlight, green }) => (
            <div key={label} className="flex justify-between items-center py-2.5 border-b last:border-b-0 border-[#f0f5f0] text-[13px]">
              <span className="text-[#7a9080]">{label}</span>
              <span className={`font-semibold ${highlight ? 'text-[#0F6E56]' : green ? 'text-[#0F6E56]' : 'text-[#04342C]'}`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Delivery note */}
        <div className="success-note bg-[#EAF3DE] border border-[#b8d898] rounded-xl p-5 text-left text-[13px] text-[#085041] leading-[1.75] mb-8">
          <div className="font-bold text-[#04342C] mb-2">📍 Bike delivery process</div>
          Show this screen to any PAAVAN campus operator. They'll verify your booking ID, deliver the
          bike to your hostel or specified location, and hand you your first{' '}
          <strong>daily unlock code</strong>.
          <br /><br />
          <strong>📱 Unlock code</strong> refreshes every midnight — check it in{' '}
          <strong>My rides</strong> each morning.
          <br /><br />
          <strong>💰 To get your ₹1,000 deposit back:</strong> Return the bike + submit a short
          condition video. Refunded within 24 hours after our operator verifies.
        </div>

        <Link
          href="/my-rides"
          className="success-btn inline-block px-8 py-3.5 bg-[#0F6E56] text-white text-[14px] font-bold rounded-[8px] hover:bg-[#085041] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(15,110,86,0.3)]"
        >
          Go to My rides →
        </Link>
      </div>

      <Footer />

      <style>{`
        @keyframes pulse-ring {
          from { box-shadow: 0 0 0 0 rgba(15,110,86,0.2); }
          to { box-shadow: 0 0 0 18px rgba(15,110,86,0); }
        }
      `}</style>
    </main>
  );
}
