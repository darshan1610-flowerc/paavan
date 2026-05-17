import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <>
      <header className="fixed top-4 left-4 right-4 z-50">
        <nav className="flex justify-between items-center px-gutter py-sm w-full max-w-7xl mx-auto rounded-full border border-secondary/30 bg-primary-container/60 backdrop-blur-xl shadow-[0_0_40px_rgba(154,217,61,0.15)]">
          <Link to="/" className="font-headline-lg-mobile md:font-headline-lg font-bold tracking-tighter text-primary">
            PAAVAN GO ELECTRIC
          </Link>
          <div className="hidden md:flex gap-md items-center">
            <Link to="/" className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors duration-300">
              Fleet
            </Link>
            <Link to="/booking" className="font-label-md text-label-md uppercase tracking-widest text-secondary font-bold">
              Booking
            </Link>
            <Link to="/booking" className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors duration-300">
              Locations
            </Link>
          </div>
          <Link to="/booking" className="bg-primary-container text-secondary font-label-md text-label-md uppercase tracking-widest px-gutter py-xs rounded-full border border-secondary/50 hover:scale-105 active:scale-95 transition-all duration-300 inline-block text-center">
            RESERVE NOW
          </Link>
        </nav>
      </header>

      {/* BottomNavBar (Mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-margin-mobile h-20 rounded-t-full bg-surface-container-lowest/80 backdrop-blur-lg border-t border-secondary/20 shadow-2xl shadow-secondary/5">
        <button className="flex flex-col items-center justify-center text-outline opacity-60 hover:opacity-100 hover:text-primary">
          <span className="material-symbols-outlined">electric_bike</span>
        </button>
        <button className="flex flex-col items-center justify-center text-outline opacity-60 hover:opacity-100 hover:text-primary">
          <span className="material-symbols-outlined">explore</span>
        </button>
        <Link to="/booking" className="flex flex-col items-center justify-center text-secondary scale-110 drop-shadow-[0_0_8px_rgba(154,217,61,0.6)]">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>account_balance_wallet</span>
        </Link>
        <button className="flex flex-col items-center justify-center text-outline opacity-60 hover:opacity-100 hover:text-primary">
          <span className="material-symbols-outlined">person</span>
        </button>
      </nav>
    </>
  );
};

export default Navbar;
