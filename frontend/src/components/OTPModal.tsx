'use client';

import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';

interface OTPModalProps {
  onVerified: (isReturning: boolean, phone: string) => void;
}

const RETURNING_PHONE = '9999999999';

type Step = 'phone' | 'otp' | 'success';

export default function OTPModal({ onVerified }: OTPModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (overlayRef.current && cardRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(cardRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', delay: 0.1 });
    }
  }, []);

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setSending(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Is the backend running?');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 4 && otp.length !== 6) {
      setError('Please enter the OTP sent to your phone');
      return;
    }
    setError('');
    setSending(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name: 'User' }),
      });
      const data = await response.json();
      if (response.ok) {
        // Save auth data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userPhone', phone);
        if (data.user) {
          localStorage.setItem('userId', data.user.id);
          if (data.user.name) {
            localStorage.setItem('userName', data.user.name);
          }
          if (data.user.date_of_birth) {
            localStorage.setItem('userDob', data.user.date_of_birth);
          }
        }

        const isReturning = data.existing === true;
        if (cardRef.current && overlayRef.current) {
          gsap.to(cardRef.current, {
            y: -20,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => onVerified(isReturning, phone),
          });
        } else {
          onVerified(isReturning, phone);
        }
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Is the backend running?');
    } finally {
      setSending(false);
    }
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/50 backdrop-blur-sm">
      <div ref={cardRef} className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-8 max-w-[400px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        {/* Icon */}
        <div className="w-14 h-14 bg-[#EAF3DE] rounded-xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 stroke-[#0F6E56] fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        {step === 'phone' && (
          <>
            <h2 className="font-display text-[22px] text-[#04342C] text-center mb-1">
              Verify your number
            </h2>
            <p className="text-[13px] text-[#7a9080] text-center mb-6">
              We'll send a quick OTP to confirm your identity before booking.
            </p>

            <label className="block text-[12px] font-semibold text-[#5a7060] mb-1.5">
              Mobile number
            </label>
            <div className="flex gap-2 mb-4">
              <span className="flex items-center px-3 bg-[#F4FAF1] border border-[#cce0cc] rounded-[8px] text-[13px] text-[#7a9080] font-medium flex-shrink-0">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                placeholder="10-digit number"
                autoFocus
                className="flex-1 px-3.5 py-2.5 border border-[#cce0cc] rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/10 transition-all"
              />
            </div>

            {error && <p className="text-[12px] text-[#A32D2D] mb-3">{error}</p>}

            <button
              onClick={handleSendOTP}
              disabled={sending}
              className="w-full py-3 bg-[#0F6E56] text-white text-[14px] font-bold rounded-[8px] hover:bg-[#085041] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(15,110,86,0.3)] disabled:opacity-60"
            >
              {sending ? 'Sending OTP...' : 'Send OTP →'}
            </button>

            <p className="text-center text-[11px] text-[#9ab09a] mt-4">
              🔒 We never store or share your number
            </p>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2 className="font-display text-[22px] text-[#04342C] text-center mb-1">
              Enter OTP
            </h2>
            <p className="text-[13px] text-[#7a9080] text-center mb-6">
              Sent to <strong className="text-[#04342C]">+91 {phone}</strong>
              <button onClick={() => setStep('phone')} className="ml-2 text-[#0F6E56] hover:underline text-[12px]">
                Change
              </button>
            </p>

            <label className="block text-[12px] font-semibold text-[#5a7060] mb-1.5">
              OTP code
            </label>
            <input
              type="tel"
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
              placeholder="Enter OTP"
              autoFocus
              className="w-full px-3.5 py-2.5 border border-[#cce0cc] rounded-[8px] text-[13px] font-sans text-center text-[18px] font-bold tracking-[8px] focus:outline-none focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/10 transition-all mb-4"
            />

            {error && <p className="text-[12px] text-[#A32D2D] mb-3">{error}</p>}

            <button
              onClick={handleVerifyOTP}
              disabled={sending}
              className="w-full py-3 bg-[#0F6E56] text-white text-[14px] font-bold rounded-[8px] hover:bg-[#085041] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(15,110,86,0.3)] disabled:opacity-60"
            >
              {sending ? 'Verifying...' : 'Verify & Continue →'}
            </button>

            <div className="text-center mt-3">
              <button className="text-[12px] text-[#0F6E56] hover:underline">
                Resend OTP in 30s
              </button>
            </div>

            <div className="mt-4 bg-[#EAF3DE] rounded-[8px] p-3 text-[11px] text-[#4a6a40] text-center">
              💡 Demo tip: Use phone <strong>9999999999</strong> to see the returning customer flow
            </div>
          </>
        )}
      </div>
    </div>
  );
}
