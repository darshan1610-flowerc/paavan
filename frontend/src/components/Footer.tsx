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
                className="block w-[130px] sm:w-[180px]"
                style={{ height: 'auto', filter: 'brightness(0) invert(1)' }}
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
                <span>@paavan_go_electric</span>
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
