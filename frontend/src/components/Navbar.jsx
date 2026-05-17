import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      <header className="fixed top-4 left-4 right-4 z-40">
        <nav className="flex justify-between items-center px-gutter py-sm w-full max-w-7xl mx-auto rounded-full border border-secondary/30 bg-primary-container/60 backdrop-blur-xl shadow-[0_0_40px_rgba(154,217,61,0.15)] relative">
          
          <div className="flex items-center gap-md">
            <button onClick={toggleMenu} className="flex flex-col gap-[5px] justify-center items-center w-10 h-10 rounded-full hover:bg-secondary/20 transition-colors z-50">
              <span className={`block w-6 h-[2px] bg-primary transition-transform ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
              <span className={`block w-6 h-[2px] bg-primary transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-[2px] bg-primary transition-transform ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
            </button>

            <Link to="/" className="font-headline-lg-mobile md:font-headline-lg font-bold tracking-tighter text-primary">
              PAAVAN GO ELECTRIC
            </Link>
          </div>

          <Link to="/booking" className="bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest px-gutter py-xs rounded-full hover:scale-105 active:scale-95 transition-all duration-300 inline-block text-center shadow-md">
            BOOK NOW
          </Link>
        </nav>
      </header>

      {/* Sidebar Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40" onClick={toggleMenu}></div>
      )}

      {/* Sidebar Menu */}
      <div className={`fixed top-0 left-0 h-screen w-64 bg-surface shadow-2xl transition-transform duration-300 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} pt-24 px-lg flex flex-col gap-md border-r border-outline/20 z-50`}>
        <button onClick={toggleMenu} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>

        <Link to="/terms" onClick={toggleMenu} className="text-on-surface font-label-md uppercase hover:text-secondary transition-colors">Terms & Conditions</Link>
        <Link to="/booking" onClick={toggleMenu} className="text-on-surface font-label-md uppercase hover:text-secondary transition-colors">Select Plan</Link>
        <Link to="/models" onClick={toggleMenu} className="text-on-surface font-label-md uppercase hover:text-secondary transition-colors">Select Model</Link>
        <Link to="/guide" onClick={toggleMenu} className="text-on-surface font-label-md uppercase hover:text-secondary transition-colors">Usage Guide</Link>
        <Link to="/feedback" onClick={toggleMenu} className="text-on-surface font-label-md uppercase hover:text-secondary transition-colors">Feedback</Link>
      </div>

      {/* BottomNavBar (Mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-margin-mobile h-20 rounded-t-full bg-surface-container-lowest/80 backdrop-blur-lg border-t border-secondary/20 shadow-2xl shadow-secondary/5">
        <Link to="/models" className="flex flex-col items-center justify-center text-outline opacity-60 hover:opacity-100 hover:text-primary">
          <span className="material-symbols-outlined">electric_bike</span>
        </Link>
        <Link to="/guide" className="flex flex-col items-center justify-center text-outline opacity-60 hover:opacity-100 hover:text-primary">
          <span className="material-symbols-outlined">explore</span>
        </Link>
        <Link to="/booking" className="flex flex-col items-center justify-center text-primary bg-secondary/20 p-2 rounded-full scale-110 drop-shadow-[0_0_8px_rgba(154,217,61,0.6)]">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>account_balance_wallet</span>
        </Link>
        <Link to="/feedback" className="flex flex-col items-center justify-center text-outline opacity-60 hover:opacity-100 hover:text-primary">
          <span className="material-symbols-outlined">rate_review</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
