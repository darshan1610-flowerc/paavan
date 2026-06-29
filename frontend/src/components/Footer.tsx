import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#04342C] text-[#9fd8bc] py-10 px-8 mt-16">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          {/* Brand */}
          <div className="max-w-[260px]">
            <Link href="/" className="block mb-3 w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="PAAVAN"
                className="block w-[130px] sm:w-[180px] rounded-lg"
                style={{ height: 'auto' }}
              />
            </Link>
            <p className="text-[12px] text-[#6aaa88] leading-relaxed">
              Campus-first micromobility for IIT Bombay. ₹39/day. No license required. Removable battery.
            </p>
          </div>

          {/* Nav + contact */}
          <div className="flex flex-wrap gap-10">
            <div>
              <div className="text-white text-[11px] font-bold mb-3 tracking-wider uppercase">Navigate</div>
              <div className="flex flex-col gap-1.5">
                {[
                  { href: '/about', label: 'About' },
                  { href: '/bikes', label: 'Browse Bikes' },
                  { href: '/plans', label: 'Browse Plans' },
                  { href: '/my-rides', label: 'My Rides' },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-[12px] text-[#6aaa88] hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="text-white text-[11px] font-bold mb-3 tracking-wider uppercase">Contact</div>
              <div className="flex flex-col gap-1.5 text-[12px] text-[#6aaa88]">
                <a href="tel:+916351243422" className="hover:text-white transition-colors">+91 63512-43422</a>
                <a
                  href="https://www.instagram.com/paavan_go_electric?igsh=MW94Zm92cHpwaGtsbw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  @paavan_go_electric
                </a>
                <span>IIT Bombay, Mumbai</span>
                <span className="mt-1 text-[#456a56]">paavan.in/admin</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1a3526] pt-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-[#456a56]">
          <span>© 2026 <span className="text-white font-semibold">PAAVAN Go-Electric (OPC) Pvt. Ltd.</span> · All rights reserved</span>
          <span>Built at IIT Bombay 🌱</span>
        </div>
      </div>
    </footer>
  );
}
