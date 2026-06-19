'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import StepIndicator from '@/components/StepIndicator';
import BikeCard from '@/components/BikeCard';
import WaitlistModal from '@/components/WaitlistModal';
import Footer from '@/components/Footer';
import { useBikeStock } from '@/lib/hooks/useBikeStock';

gsap.registerPlugin(useGSAP);

const STEPS = [
  { label: 'Select bike' },
  { label: 'Choose plan' },
  { label: 'Details' },
  { label: 'Payment' },
];

const BIKES = [
  {
    id: 'hero-sprint',
    name: 'Hero Sprint',
    accentColor: '#4a5a2a',
    imageUrl: '/bikes/hero-sprint.png',
    tag: 'Campus Favourite',
    specs: [
      '48 km range',
      'Dual disc brakes',
      'Front suspension',
      '29" wheels',
      'Light & horn',
    ],
    inStock: true,
    units: 4,
  },
  {
    id: 'mach-city',
    name: 'Mach City',
    accentColor: '#0F6E56',
    imageUrl: '/bikes/machcity.png',
    specs: [
      '16 km range',
      'Dual disc brakes',
      '26" wheels',
    ],
    inStock: true,
    units: 3,
  },
  {
    id: 'geekay',
    name: 'Geekay',
    accentColor: '#1D9E75',
    imageUrl: '/bikes/Geekay.png',
    specs: [
      '16 km range',
      'Dual disc brakes',
      '26" wheels',
      'Light & horn',
    ],
    inStock: true,
    units: 3,
  },
  {
    id: 'sturdy-austere',
    name: 'Sturdy Austere',
    accentColor: '#085041',
    imageUrl: '/bikes/sturdy-auster.png',
    tag: 'Longest Range',
    specs: [
      '120 km range',
      'Dual disc brakes',
      'Front suspension',
      '29" wheels',
      'Light & horn',
    ],
    inStock: true,
    units: 2,
  },
  {
    id: 'raleigh',
    name: 'Raleigh',
    accentColor: '#1a56db',
    imageUrl: '/bikes/Raleigh.png',
    specs: [
      '16 km range',
      'Power brakes',
      '26" wheels',
    ],
    inStock: true,
    units: 3,
  },
  {
    id: 'schnell',
    name: 'Schnell',
    accentColor: '#c0392b',
    imageUrl: '/bikes/schnell.png',
    specs: [
      '16 km range',
      'Dual disc brakes',
      'Front suspension',
      '26" wheels',
    ],
    inStock: true,
    units: 4,
  },
  {
    id: 'urban-terrain',
    name: 'Urban Terrain',
    accentColor: '#6d28d9',
    imageUrl: '/bikes/Urban-terrain.png',
    specs: [
      '32 km range',
      'Dual disc brakes',
      '26" wheels',
      'Light & horn',
      'Rear carrier',
    ],
    inStock: true,
    units: 3,
  },
  {
    id: 'hero-winn',
    name: 'Hero Winn',
    accentColor: '#0F6E56',
    imageUrl: '/bikes/Herowinn.png',
    specs: [
      '35 km range',
      'Dual disc brakes',
      '24" wheels',
      'Light & horn',
    ],
    inStock: true,
    units: 3,
  },
  {
    id: 'nebzee-black',
    name: 'Nebzee Black',
    accentColor: '#1a1a1a',
    imageUrl: '/bikes/Nebzee-black.png',
    specs: [
      '16 km range',
      'Disc brake',
      '26" wheels',
    ],
    inStock: true,
    units: 2,
  },
  {
    id: 'nebzee-copper',
    name: 'Nebzee Copper',
    accentColor: '#b45309',
    imageUrl: '/bikes/Nebzee-copper.png',
    specs: [
      '16 km range',
      'Disc brake',
      '26" wheels',
    ],
    inStock: true,
    units: 2,
  },
  {
    id: 'axiro-blue',
    name: 'Axiro Blue',
    accentColor: '#1e40af',
    imageUrl: '/bikes/AXIRO%20BLUE.png',
    specs: [
      '16 km range',
      'Dual disc brakes',
      'Front suspension',
      '27.5" wheels',
    ],
    inStock: true,
    units: 3,
  },
  {
    id: 'axiro-red',
    name: 'Axiro Red',
    accentColor: '#dc2626',
    imageUrl: '/bikes/AXIRO%20RED.png',
    specs: [
      '16 km range',
      'Dual disc brakes',
      'Front suspension',
      '27.5" wheels',
    ],
    inStock: true,
    units: 3,
  },
];

import { createClient } from '@/lib/supabase/client';

export default function BikesPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [waitlistBike, setWaitlistBike] = useState<string | null>(null);
  const [bikes, setBikes] = useState<any[]>(BIKES);
  const liveStock = useBikeStock();

  useEffect(() => {
    async function loadBikes() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('bikes')
          .select('*')
          .eq('is_active', true);
        
        if (data && data.length > 0) {
          const mapped = data.map(dbBike => {
            const existing = BIKES.find(b => b.name.toLowerCase() === dbBike.name.toLowerCase());
            
            let imageUrl = dbBike.image_path || existing?.imageUrl || '/bikes/machcity.png';
            if (imageUrl.startsWith('bike-images/') || imageUrl.startsWith('bike_images/')) {
              const cleanPath = imageUrl.replace(/^(bike-images\/|bike_images\/)/, '');
              const { data: publicUrlData } = supabase.storage.from('bike-images').getPublicUrl(cleanPath);
              imageUrl = publicUrlData?.publicUrl || imageUrl;
            }

            return {
              id: dbBike.id,
              name: dbBike.name,
              accentColor: existing?.accentColor || '#0F6E56',
              imageUrl: imageUrl,
              tag: dbBike.available_units === 0 ? 'Out of Stock' : (existing?.tag || null),
              specs: Array.isArray(dbBike.specs) ? dbBike.specs : (existing?.specs || []),
              inStock: dbBike.available_units > 0,
              units: dbBike.available_units,
            };
          });
          setBikes(mapped);
        }
      } catch (err) {
        console.error('Error fetching bikes from database:', err);
      }
    }
    loadBikes();
  }, []);

  useGSAP(
    () => {
      gsap.from('.page-heading', {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.1,
      });
      gsap.from('.bike-card', {
        y: 50,
        opacity: 0,
        stagger: 0.14,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.3,
      });
      gsap.from('.bikes-info-strip', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.55,
      });
    },
    { scope: containerRef }
  );

  const handleSelectBike = (bike: any) => {
    localStorage.setItem(
      'paavan_bike',
      JSON.stringify({ id: bike.id, name: bike.name })
    );
    router.push('/plans');
  };

  return (
    <main className="min-h-screen">
      <div ref={containerRef} className="max-w-[1000px] mx-auto px-6 py-10">
        <StepIndicator steps={STEPS} currentStep={1} />

        <div className="page-heading mb-8">
          <h1 className="font-display text-[26px] sm:text-[32px] text-[#04342C]">Choose your e-bike</h1>
          <p className="text-[13px] text-[#7a9080] mt-1.5">
            All bikes include pedal assist, headlight, horn, key-based lock &amp; on-call campus maintenance.
            Pricing is on the next step.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {bikes.map((bike) => {
            const live = liveStock[bike.name];
            const inStock = live ? live.isActive && live.availableUnits > 0 : bike.inStock;
            const units = live ? live.availableUnits : bike.units;
            return (
              <BikeCard
                key={bike.id}
                {...bike}
                inStock={inStock}
                units={units}
                onSelect={() => handleSelectBike(bike)}
                onWaitlist={() => setWaitlistBike(bike.name)}
              />
            );
          })}
        </div>

        {/* Info strip */}
        <div className="bikes-info-strip mt-10 bg-white border border-[#cce0cc] rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-10 h-10 bg-[#EAF3DE] rounded-[10px] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 stroke-[#0F6E56] fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="text-[14px] font-bold text-[#04342C] mb-1">All bikes include</div>
            <div className="text-[12px] text-[#7a9080] leading-relaxed">
              Removable waterproof battery · Pedal assist up to 50 km/h · Key-based throttle lock ·
              Daily unlock code · On-call campus maintenance · ₹1,000 refundable security deposit
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <WaitlistModal
        bikeName={waitlistBike ?? ''}
        isOpen={!!waitlistBike}
        onClose={() => setWaitlistBike(null)}
      />
    </main>
  );
}
