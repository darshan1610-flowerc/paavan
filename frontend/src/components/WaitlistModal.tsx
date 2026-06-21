'use client';

import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';

interface WaitlistModalProps {
  bikeId: string;
  bikeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ bikeId, bikeName, isOpen, onClose }: WaitlistModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (overlayRef.current && modalRef.current) {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
        gsap.fromTo(modalRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out', delay: 0.05 });
      }
    } else {
      document.body.style.overflow = '';
      setPhone('');
      setPosition(null);
      setError('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, { y: 20, opacity: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in', delay: 0.05, onComplete: onClose });
    } else {
      onClose();
    }
  };

  const handleJoin = async () => {
    if (phone.length !== 10) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, bikeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to join waitlist');
        return;
      }
      setPosition(data.position);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[500] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div ref={modalRef} className="bg-white rounded-2xl p-8 max-w-[440px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#9ab09a] hover:text-[#04342C] p-1 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        {position === null ? (
          <>
            <div className="w-16 h-16 bg-[#FAEEDA] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 stroke-[#854F0B] fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-display text-[22px] text-[#04342C] text-center mb-2">
              {bikeName} is currently unavailable
            </h2>
            <p className="text-[13px] text-[#7a9080] text-center leading-relaxed mb-6">
              Join our priority waitlist for free — we'll notify you first when this bike is back in stock.
            </p>

            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-[#5a7060] mb-1.5">Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2.5 border border-[#cce0cc] rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/10 transition-all"
              />
            </div>

            {error && (
              <p className="text-[12px] text-[#A32D2D] mb-3 bg-[#FCEBEB] px-3 py-2 rounded-[8px]">{error}</p>
            )}

            <button
              onClick={handleJoin}
              disabled={phone.length !== 10 || submitting}
              className="w-full py-3.5 bg-[#0F6E56] text-white text-[14px] font-bold rounded-[8px] hover:bg-[#085041] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(15,110,86,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mb-3"
            >
              {submitting ? 'Joining waitlist...' : 'Join priority waitlist →'}
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-[#EAF3DE] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 stroke-[#0F6E56] fill-none" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-display text-[22px] text-[#04342C] text-center mb-2">
              You're on the list! 🎉
            </h2>
            <p className="text-[13px] text-[#7a9080] text-center leading-relaxed mb-2">
              You're <strong className="text-[#04342C]">#{position}</strong> in the queue for <strong className="text-[#04342C]">{bikeName}</strong>.
            </p>
            <p className="text-[12px] text-[#7a9080] text-center leading-relaxed mb-6">
              We'll notify <strong className="text-[#04342C]">+91 {phone}</strong> as soon as it's back in stock.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-[#0F6E56] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#085041] active:scale-[0.98] transition-all"
            >
              Got it, thanks!
            </button>
          </>
        )}
      </div>
    </div>
  );
}
