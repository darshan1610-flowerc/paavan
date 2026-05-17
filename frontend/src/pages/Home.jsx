import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="pt-32 pb-32">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop mb-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg items-center">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg mb-base leading-tight">
              Select Your <span className="text-secondary">Ride</span>
            </h1>
            <p className="text-on-surface-variant text-body-lg max-w-md mb-lg">
              Precision engineering meets sustainable mobility. Choose your journey with Paavan's flagship electric fleet.
            </p>
            <div className="flex flex-wrap gap-sm">
              <div className="flex items-center gap-xs px-sm py-xs glass-panel rounded-lg">
                <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
                <span className="font-label-sm text-label-sm uppercase">Quick Charge</span>
              </div>
              <div className="flex items-center gap-xs px-sm py-xs glass-panel rounded-lg">
                <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>distance</span>
                <span className="font-label-sm text-label-sm uppercase">80km Range</span>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-secondary/10 blur-[120px] rounded-full group-hover:bg-secondary/20 transition-all duration-700"></div>
            {/* Displaying the custom generated bike PNG */}
            <img 
              alt="Premium Electric Bicycle" 
              className="relative z-10 w-full h-auto drop-shadow-[0_20px_50px_rgba(154,217,61,0.3)] animate-float scale-110" 
              src="/hero_bike.png" 
            />
          </div>
        </div>
      </section>

      {/* Plan Selection */}
      <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop mb-xl">
        <div className="text-center mb-lg">
          <h2 className="font-headline-lg text-headline-lg mb-xs">Select Your Plan</h2>
          <div className="h-1 w-24 bg-secondary mx-auto rounded-full shadow-[0_0_8px_rgba(154,217,61,1)]"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Daily Access */}
          <div className="tilt-card glass-panel p-lg rounded-xl flex flex-col justify-between neon-glow-hover">
            <div>
              <div className="mb-md">
                <span className="px-sm py-xs bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest rounded-full">Explorer</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-base">Daily Access</h3>
              <p className="text-on-surface-variant mb-lg">Perfect for spontaneous city adventures and quick commutes.</p>
              <div className="flex items-baseline gap-xs mb-lg">
                <span className="text-headline-lg font-bold text-on-surface">₹99</span>
                <span className="text-on-surface-variant font-label-md">/day</span>
              </div>
            </div>
            <Link to="/booking?plan=daily" className="w-full text-center block py-md rounded-xl border border-secondary/30 text-secondary font-label-md uppercase tracking-widest hover:bg-secondary hover:text-on-secondary transition-all duration-300">
              Book Now
            </Link>
          </div>

          {/* Weekly Pass */}
          <div className="tilt-card glass-panel p-lg rounded-xl flex flex-col justify-between border-secondary/40 relative scale-105 shadow-[0_0_40px_rgba(154,217,61,0.1)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-gutter py-base bg-secondary text-on-secondary font-label-md text-label-md uppercase font-bold tracking-widest rounded-full shadow-lg">
              POPULAR CHOICE
            </div>
            <div>
              <div className="mb-md">
                <span className="px-sm py-xs bg-secondary/20 text-secondary font-label-sm text-label-sm uppercase tracking-widest rounded-full">Commuter</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-base">Weekly Pass</h3>
              <p className="text-on-surface-variant mb-lg">Balanced efficiency for your regular weekly transportation needs.</p>
              <div className="flex items-baseline gap-xs mb-lg">
                <span className="text-headline-lg font-bold text-on-surface">₹69</span>
                <span className="text-on-surface-variant font-label-md">/day</span>
              </div>
            </div>
            <Link to="/booking?plan=weekly" className="w-full text-center block py-md rounded-xl bg-primary-container text-secondary border border-secondary font-label-md uppercase tracking-widest animated-border hover:scale-105 transition-all">
              Select Weekly
            </Link>
          </div>

          {/* Monthly Elite */}
          <div className="tilt-card glass-panel p-lg rounded-xl flex flex-col justify-between neon-glow-hover">
            <div>
              <div className="mb-md">
                <span className="px-sm py-xs bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest rounded-full">Pro</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-base">Monthly Elite</h3>
              <p className="text-on-surface-variant mb-lg">Unlimited freedom. The ultimate eco-friendly transportation solution.</p>
              <div className="flex items-baseline gap-xs mb-lg">
                <span className="text-headline-lg font-bold text-on-surface">₹39</span>
                <span className="text-on-surface-variant font-label-md">/day</span>
              </div>
            </div>
            <Link to="/booking?plan=monthly" className="w-full text-center block py-md rounded-xl border border-secondary/30 text-secondary font-label-md uppercase tracking-widest hover:bg-secondary hover:text-on-secondary transition-all duration-300">
              Go Elite
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
