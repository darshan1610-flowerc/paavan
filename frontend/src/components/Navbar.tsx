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

  const baseNav = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled
      ? 'bg-white/97 backdrop-blur-md shadow-[0_2px_20px_rgba(15,110,86,0.08)] border-b border-[#e8f0e8]'
      : 'bg-white/95 backdrop-blur-sm border-b border-[rgba(15,110,86,0.07)]'
  }`;

  return (
    <nav ref={navRef} className={baseNav}>

      {/* ── Row 1: Logo + Rent now ── */}
      <div className="h-[56px] flex items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="PAAVAN"
            className="block w-[180px] sm:w-[210px] md:w-[240px]"
            style={{ height: 'auto' }}
          />
        </Link>

        {/* Desktop nav links (visible md+) */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ href, label }) => (
            <NavLink key={href} href={href}>{label}</NavLink>
          ))}
          <Link
            href="/bikes"
            className="ml-3 px-4 py-2 bg-[#0F6E56] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#085041] active:scale-95 transition-all duration-150 shadow-[0_2px_10px_rgba(15,110,86,0.28)]"
          >
            Rent now
          </Link>
        </div>

        {/* Mobile: Rent now button always visible */}
        <Link
          href="/bikes"
          className="md:hidden px-4 py-2 bg-[#0F6E56] text-white text-[13px] font-bold rounded-[8px] active:scale-95 transition-all shadow-[0_2px_10px_rgba(15,110,86,0.28)]"
        >
          Rent now
        </Link>
      </div>

      {/* ── Row 2: Nav links — mobile only ── */}
      <div className="md:hidden border-t border-[#edf5ed] overflow-x-auto scrollbar-none">
        <div className="flex items-stretch h-[38px] w-max min-w-full px-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center px-3.5 text-[12px] font-semibold text-[#4a6054] hover:text-[#0F6E56] hover:bg-[#f4faf1] rounded-[6px] whitespace-nowrap transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3.5 py-2 rounded-[8px] text-[13px] font-medium text-[#4a6054] hover:bg-[#EAF3DE] hover:text-[#085041] transition-all duration-150"
    >
      {children}
    </Link>
  );
}
