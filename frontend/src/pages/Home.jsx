import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [currentBikeIndex, setCurrentBikeIndex] = useState(0);

  const heroBikes = [
    "mach_city.jpeg",
    "geekay.jpeg",
    "schnell.jpeg",
    "urban_terrain.jpeg",
    "raleigh.jpeg",
    "nebzee_black.jpeg",
    "hero_hustle.jpeg",
    "hero_winn.jpeg",
    "sturdy_axiro_red.jpeg",
    "sturdy_tweak.jpeg",
    "sturdy_axiro.jpeg",
    "nebzee_copper.jpeg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBikeIndex((prev) => (prev + 1) % heroBikes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-24 pb-0 min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center px-margin-mobile md:px-margin-desktop overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
          <div className="z-10 text-center lg:text-left pt-12 lg:pt-0">

            
            <h1 className="font-headline-lg-mobile md:font-display-lg text-primary font-bold leading-tight mb-md">
              Your Daily Commute, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary drop-shadow-sm">Reinvented.</span>
            </h1>
            
            <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto lg:mx-0 mb-lg">
              Affordable electric bikes built for campuses, students, and modern urban mobility. Save hours every week with a smarter, greener, and more reliable ride.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button onClick={() => navigate('/booking')} className="px-8 py-4 rounded-full bg-primary text-on-primary font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_8px_20px_rgba(4,94,76,0.3)] hover:shadow-[0_12px_25px_rgba(4,94,76,0.5)]">
                Get Your E-Bike
              </button>

            </div>
          </div>

          {/* Hero Visuals */}
          <div className="relative w-full h-[50vh] lg:h-full min-h-[400px] flex items-center justify-center">
            {/* Floating Stats */}
            <div className="absolute top-10 right-0 lg:-right-10 bg-surface/80 backdrop-blur-md border border-outline/30 p-4 rounded-2xl shadow-xl animate-float z-20">
              <p className="font-label-sm text-on-surface-variant uppercase">Range</p>
              <p className="font-headline-sm text-primary font-bold">Up to 150 km</p>
            </div>
            
            <div className="absolute bottom-10 left-0 lg:-left-10 bg-surface/80 backdrop-blur-md border border-outline/30 p-4 rounded-2xl shadow-xl animate-float-delayed z-20">
              <p className="font-label-sm text-on-surface-variant uppercase">Time Saved</p>
              <p className="font-headline-sm text-secondary font-bold">7–8 Hrs Weekly</p>
            </div>

            <div className="relative w-full max-w-[400px] lg:max-w-[500px] aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse-slow"></div>
              <img 
                key={currentBikeIndex}
                src={`/${heroBikes[currentBikeIndex]}`} 
                alt="PAAVAN Go Electric Cycle" 
                className="w-full h-full object-contain z-10 drop-shadow-[0_20px_40px_rgba(4,94,76,0.2)] animate-flip-in"
                style={{ filter: 'drop-shadow(0px 30px 40px rgba(154,217,61,0.2))' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section className="py-32 bg-surface-container-low px-margin-mobile md:px-margin-desktop relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-primary mb-6">Still wasting hours commuting every week?</h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Walking long distances. Expensive autos. Crowded campus transport. Unreliable availability.
              <br/><br/>
              <span className="font-bold text-primary">PAAVAN</span> helps students and commuters move smarter with affordable electric bikes designed for everyday convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { stat: "80%", text: "of students rely on walking or cycling" },
              { stat: "7-8 Hrs", text: "lost weekly commuting" },
              { stat: "₹2000+", text: "monthly commuting expense" },
              { stat: "53%", text: "of shipping costs is last-mile delivery" }
            ].map((item, i) => (
              <div key={i} className="glass-panel p-8 rounded-2xl border border-error/10 hover:border-error/30 transition-colors text-center group">
                <h3 className="font-display-md text-error/80 group-hover:text-error mb-2 transition-colors">{item.stat}</h3>
                <p className="font-label-md text-on-surface-variant">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHY PAAVAN SECTION */}
      <section className="py-32 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-headline-lg text-primary text-center mb-16">Built For Real Everyday Mobility</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "bolt", title: "Long Range Performance", desc: "Travel up to 150 km with pedal assist." },
              { icon: "battery_charging_full", title: "Removable Smart Battery", desc: "Charge anywhere in just 1–2 hours." },
              { icon: "shield_lock", title: "Safe & Secure", desc: "Key locks and real-time tracking for peace of mind." },
              { icon: "water_drop", title: "Built for Indian Roads", desc: "Waterproof battery system and durable frame design." },
              { icon: "payments", title: "Affordable Monthly Plans", desc: "Smarter than spending on autos every day." },
              { icon: "handyman", title: "Reliable Maintenance", desc: "On-call servicing keeps your ride always ready." }
            ].map((feature, i) => (
              <div key={i} className="glass-panel p-8 rounded-2xl border border-outline/20 hover:border-secondary/50 hover:bg-secondary/5 transition-all group duration-300 transform hover:-translate-y-2">
                <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary text-[28px] group-hover:text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>{feature.icon}</span>
                </div>
                <h3 className="font-headline-sm text-on-surface mb-3">{feature.title}</h3>
                <p className="font-body-md text-on-surface-variant">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TRANSFORMATION SECTION */}
      <section className="py-32 bg-primary text-on-primary px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
          <div>
            <h2 className="font-headline-lg mb-6">More Than Just An E-Bike</h2>
            <p className="font-body-lg text-primary-container/80 mb-8 max-w-lg">
              PAAVAN doesn’t just help you travel faster. It gives you back your time.<br/><br/>
              What once took nearly an hour can now take minutes. More classes. More productivity. More freedom.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-surface/10 p-8 rounded-2xl backdrop-blur-md border border-white/10">
              <h3 className="font-label-lg uppercase tracking-widest text-error/80 mb-6">Before PAAVAN</h3>
              <ul className="space-y-4">
                {['55–60 mins commute', 'Expensive autos', 'Walking long distances'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-body-md text-white/70">
                    <span className="material-symbols-outlined text-error/80 text-[20px]">close</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-surface p-8 rounded-2xl shadow-2xl relative overflow-hidden transform sm:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-bl-full -z-10"></div>
              <h3 className="font-label-lg uppercase tracking-widest text-primary mb-6">After PAAVAN</h3>
              <ul className="space-y-4">
                {['10–15 mins commute', 'Affordable monthly cost', 'Comfortable electric mobility'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-body-md text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRODUCT SHOWCASE */}
      <section className="py-32 px-margin-mobile md:px-margin-desktop overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="font-headline-lg text-primary">Designed For Modern Urban Riders</h2>
        </div>
        
        <div className="max-w-7xl mx-auto relative flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-secondary/5 rounded-full blur-[100px] -z-10"></div>
          
          <div className="lg:w-1/3 flex flex-col gap-6 text-right order-2 lg:order-1">
            {[
              { title: "150 km+ Range", desc: "Assisted range for long rides" },
              { title: "25 km/h Top Speed", desc: "Perfect for city limits" },
              { title: "Pedal Assist", desc: "Smart technology integration" }
            ].map((spec, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl border border-outline/10">
                <h4 className="font-headline-sm text-primary mb-1">{spec.title}</h4>
                <p className="font-label-sm text-on-surface-variant">{spec.desc}</p>
              </div>
            ))}
          </div>

          <div className="lg:w-1/3 w-full relative flex justify-center order-1 lg:order-2">
            <img 
              key={currentBikeIndex} 
              src={`/${heroBikes[currentBikeIndex]}`} 
              alt="PAAVAN Cycle Showcase" 
              className="w-full max-w-[400px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 animate-flip-in" 
            />
          </div>

          <div className="lg:w-1/3 flex flex-col gap-6 text-left order-3">
            {[
              { title: "Built-in Storage Box", desc: "Securely carry your items" },
              { title: "High-power BLDC Motor", desc: "Efficient and reliable" },
              { title: "Waterproof Battery", desc: "Safe in all weather conditions" }
            ].map((spec, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl border border-outline/10">
                <h4 className="font-headline-sm text-primary mb-1">{spec.title}</h4>
                <p className="font-label-sm text-on-surface-variant">{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHO IT'S FOR */}
      <section className="py-32 bg-surface-container-low px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-headline-lg text-primary text-center mb-16">Perfect For</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "school", title: "Students", desc: "Affordable daily commuting across large campuses." },
              { icon: "local_shipping", title: "Delivery Partners", desc: "Higher range. Lower rental costs. More deliveries." },
              { icon: "holiday_village", title: "Gated Communities", desc: "Clean, efficient internal transportation." },
              { icon: "location_city", title: "Smart Urban Mobility", desc: "Sustainable transportation for growing cities." }
            ].map((item, i) => (
              <div key={i} className="bg-surface p-8 rounded-2xl shadow-lg border-t-4 border-secondary hover:-translate-y-2 transition-transform duration-300">
                <span className="material-symbols-outlined text-[40px] text-primary mb-4" style={{fontVariationSettings: "'FILL' 1"}}>{item.icon}</span>
                <h3 className="font-headline-sm text-on-surface mb-3">{item.title}</h3>
                <p className="font-body-md text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. WHY CUSTOMERS CHOOSE US */}
      <section className="py-32 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl">
          <div>
            <h2 className="font-headline-lg text-primary mb-10">Why Riders Choose PAAVAN</h2>
            <ul className="space-y-6">
              {[
                "Lower monthly cost than electric scooters",
                "No fuel expenses",
                "Eco-friendly transportation",
                "Easy charging at home or hostel",
                "No dependency on crowded transport",
                "Built specifically for Indian usage conditions"
              ].map((point, i) => (
                <li key={i} className="flex items-center gap-4 font-headline-sm text-on-surface">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[20px]">check</span>
                  </div>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 content-center">
             <div className="glass-panel p-8 rounded-2xl text-center shadow-lg border border-secondary/20">
                <h3 className="font-display-md text-secondary mb-2">₹999</h3>
                <p className="font-label-md text-on-surface-variant uppercase">/month for students</p>
             </div>
             <div className="glass-panel p-8 rounded-2xl text-center shadow-lg border border-secondary/20">
                <h3 className="font-display-md text-secondary mb-2">₹3000</h3>
                <p className="font-label-md text-on-surface-variant uppercase">/month for delivery</p>
             </div>
             <div className="glass-panel p-8 rounded-2xl text-center shadow-lg border border-secondary/20">
                <h3 className="font-display-md text-primary mb-2">75-80%</h3>
                <p className="font-label-md text-on-surface-variant uppercase">ROI efficiency</p>
             </div>
             <div className="glass-panel p-8 rounded-2xl text-center shadow-lg border border-secondary/20">
                <h3 className="font-display-md text-primary mb-2">100+ km</h3>
                <p className="font-label-md text-on-surface-variant uppercase">Daily heavy-duty cap.</p>
             </div>
          </div>
        </div>
      </section>

      {/* 8. FUTURE VISION */}
      <section className="py-32 bg-surface-container-high px-margin-mobile md:px-margin-desktop">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline-lg text-primary mb-6">Building The Future Of Micromobility In India</h2>
          <p className="font-body-lg text-on-surface-variant mb-16">
            Starting from campuses and expanding toward smarter urban mobility ecosystems across India. PAAVAN is creating affordable, scalable, and sustainable transportation solutions for the next generation.
          </p>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative before:absolute before:content-[''] before:w-full before:h-1 before:bg-outline-variant before:top-1/2 before:-translate-y-1/2 before:hidden md:before:block">
            {[
              { step: 1, title: "IIT Bombay Deployment" },
              { step: 2, title: "Expansion to Campuses" },
              { step: 3, title: "Delivery Ecosystem" },
              { step: 4, title: "Smart Urban Mobility" }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center bg-surface-container-high px-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4 shadow-lg ${i === 0 ? 'bg-secondary text-primary' : 'bg-surface border-2 border-outline text-on-surface'}`}>
                  {item.step}
                </div>
                <h4 className="font-label-md text-on-surface max-w-[120px]">{item.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-32 px-margin-mobile md:px-margin-desktop relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#023b30] -z-20"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] -z-10"></div>
        
        <div className="max-w-4xl mx-auto text-center text-on-primary">
          <h2 className="font-display-md md:font-display-lg font-bold mb-4">Ready To Ride Smarter?</h2>
          <p className="font-body-lg text-white/80 mb-12">Join the electric mobility movement with PAAVAN.</p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button onClick={() => navigate('/booking')} className="px-8 py-4 rounded-full bg-secondary text-primary font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(154,217,61,0.4)]">
              Book a Ride
            </button>
            <button className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold uppercase tracking-widest hover:bg-white/20 transition-all">
              Join Waitlist
            </button>
            <button onClick={() => navigate('/support')} className="px-8 py-4 rounded-full bg-transparent border-2 border-secondary/50 text-secondary font-bold uppercase tracking-widest hover:bg-secondary/10 transition-all">
              Partner With Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
