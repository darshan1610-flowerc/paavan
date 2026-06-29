'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/bikes', label: 'Browse bikes' },
  { href: '/plans', label: 'Browse plans' },
  { href: '/my-rides', label: 'My rides' },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useGSAP(
    () => {
      gsap.from(navRef.current, { y: -80, opacity: 0, duration: 0.8, ease: 'power3.out' });
    },
    { scope: navRef }
  );

  const baseNav = `fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e8f0e8] transition-all duration-300 ${
    scrolled ? 'shadow-[0_2px_12px_rgba(15,110,86,0.08)]' : ''
  }`;

  return (
    <nav ref={navRef} className={baseNav}>

      {/* ── Main row ── */}
      <div className="h-[64px] sm:h-[80px] lg:h-[101px] flex items-center justify-between px-4 sm:px-6 lg:px-9">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="PAAVAN"
            className="block w-[110px] sm:w-[160px] lg:w-[220px]"
            style={{ height: 'auto' }}
          />
        </Link>

        {/* Desktop nav links (lg+) */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2 rounded-[8px] text-[15px] font-medium text-[#4a6054] hover:bg-[#EAF3DE] hover:text-[#085041] transition-all duration-150 whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/bikes"
            className="ml-3 px-5 py-2.5 bg-[#0F6E56] text-white text-[15px] font-semibold rounded-[9px] hover:bg-[#085041] active:scale-95 transition-all duration-150 shadow-[0_2px_10px_rgba(15,110,86,0.28)] whitespace-nowrap"
          >
            Rent now
          </Link>
        </div>

        {/* Tablet + mobile right side */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            href="/bikes"
            className="px-4 py-2 bg-[#0F6E56] text-white text-[13px] sm:text-[14px] font-bold rounded-[8px] active:scale-95 transition-all shadow-[0_2px_10px_rgba(15,110,86,0.28)] whitespace-nowrap"
          >
            Rent now
          </Link>
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-[8px] hover:bg-[#f4faf1] transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 stroke-[#0F6E56]" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div className="lg:hidden border-t border-[#edf5ed] bg-white px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 text-[15px] font-semibold text-[#4a6054] hover:text-[#0F6E56] hover:bg-[#f4faf1] rounded-[8px] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}

    </nav>
  );
}
