'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type View = 'login' | 'reset-request' | 'reset-confirm';

export default function AdminLoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('login');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetMessages = () => {
    setError('');
    setInfo('');
  };

  const handleLogin = async () => {
    resetMessages();
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setLocked(true);
          setError(data.error);
        } else {
          setError(data.error ?? 'Login failed');
          if (typeof data.attemptsRemaining === 'number') {
            setAttemptsRemaining(data.attemptsRemaining);
          }
        }
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReset = async () => {
    resetMessages();
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not send OTP');
        return;
      }
      setInfo(data.message);
      setView('reset-confirm');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReset = async () => {
    resetMessages();
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not reset password');
        return;
      }
      setInfo('Password reset. You can now log in.');
      setView('login');
      setPassword('');
      setOtp('');
      setNewPassword('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-5" style={{ background: '#071912' }}>
      <div className="w-full max-w-[400px] bg-[#0d2a20] border border-[#163a2c] rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        {/* Shield logo */}
        <div className="w-14 h-14 bg-[#0F6E56] rounded-xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 stroke-white fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        {view === 'login' && (
          <>
            <h1 className="font-display text-[22px] text-white text-center mb-1">Operator Login</h1>
            <p className="text-[13px] text-[#7adbb4] text-center mb-6">PAAVAN Admin</p>

            <label className="block text-[12px] font-semibold text-[#9fd8bc] mb-1.5">Phone number</label>
            <div className="flex gap-2 mb-3">
              <span className="flex items-center px-3 bg-[#163a2c] border border-[#1f4a38] rounded-[8px] text-[13px] text-[#9fd8bc] font-medium flex-shrink-0">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="10-digit number"
                disabled={locked}
                className="flex-1 px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white font-sans focus:outline-none focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/20 transition-all disabled:opacity-50"
              />
            </div>

            <label className="block text-[12px] font-semibold text-[#9fd8bc] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              disabled={locked}
              className="w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white font-sans focus:outline-none focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/20 transition-all disabled:opacity-50 mb-4"
            />

            {error && (
              <div
                className={`text-[12px] mb-3 px-3 py-2 rounded-[8px] ${
                  locked || (attemptsRemaining !== null && attemptsRemaining <= 2)
                    ? 'bg-[#3a1414] text-[#f5b0b0] border border-[#5a2020]'
                    : 'text-[#f5b0b0]'
                }`}
              >
                {error}
              </div>
            )}
            {info && <p className="text-[12px] text-[#7adbb4] mb-3">{info}</p>}

            <button
              onClick={handleLogin}
              disabled={submitting || locked}
              className="w-full py-3 bg-[#0F6E56] text-white text-[14px] font-bold rounded-[8px] hover:bg-[#085041] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(15,110,86,0.3)] disabled:opacity-50"
            >
              {submitting ? 'Logging in...' : 'Log in →'}
            </button>

            <div className="text-center mt-4">
              <button
                onClick={() => { setView('reset-request'); resetMessages(); }}
                className="text-[12px] text-[#7adbb4] hover:underline"
              >
                Send OTP to reset password
              </button>
            </div>
          </>
        )}

        {view === 'reset-request' && (
          <>
            <h1 className="font-display text-[22px] text-white text-center mb-1">Reset password</h1>
            <p className="text-[13px] text-[#7adbb4] text-center mb-6">We&apos;ll text an OTP to your registered number</p>

            <label className="block text-[12px] font-semibold text-[#9fd8bc] mb-1.5">Phone number</label>
            <div className="flex gap-2 mb-4">
              <span className="flex items-center px-3 bg-[#163a2c] border border-[#1f4a38] rounded-[8px] text-[13px] text-[#9fd8bc] font-medium flex-shrink-0">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => e.key === 'Enter' && handleRequestReset()}
                placeholder="10-digit number"
                autoFocus
                className="flex-1 px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white font-sans focus:outline-none focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/20 transition-all"
              />
            </div>

            {error && <p className="text-[12px] text-[#f5b0b0] mb-3">{error}</p>}

            <button
              onClick={handleRequestReset}
              disabled={submitting}
              className="w-full py-3 bg-[#0F6E56] text-white text-[14px] font-bold rounded-[8px] hover:bg-[#085041] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(15,110,86,0.3)] disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send OTP →'}
            </button>

            <div className="text-center mt-4">
              <button onClick={() => { setView('login'); resetMessages(); }} className="text-[12px] text-[#7adbb4] hover:underline">
                Back to login
              </button>
            </div>
          </>
        )}

        {view === 'reset-confirm' && (
          <>
            <h1 className="font-display text-[22px] text-white text-center mb-1">Enter OTP</h1>
            <p className="text-[13px] text-[#7adbb4] text-center mb-6">
              Sent to <strong>+91 {phone}</strong>
            </p>

            <label className="block text-[12px] font-semibold text-[#9fd8bc] mb-1.5">OTP code</label>
            <input
              type="tel"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit OTP"
              autoFocus
              className="w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white font-sans text-center text-[18px] font-bold tracking-[6px] focus:outline-none focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/20 transition-all mb-4"
            />

            <label className="block text-[12px] font-semibold text-[#9fd8bc] mb-1.5">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmReset()}
              placeholder="At least 8 characters"
              className="w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white font-sans focus:outline-none focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/20 transition-all mb-4"
            />

            {error && <p className="text-[12px] text-[#f5b0b0] mb-3">{error}</p>}
            {info && <p className="text-[12px] text-[#7adbb4] mb-3">{info}</p>}

            <button
              onClick={handleConfirmReset}
              disabled={submitting}
              className="w-full py-3 bg-[#0F6E56] text-white text-[14px] font-bold rounded-[8px] hover:bg-[#085041] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(15,110,86,0.3)] disabled:opacity-50"
            >
              {submitting ? 'Resetting...' : 'Reset password →'}
            </button>

            <div className="text-center mt-4">
              <button onClick={() => { setView('login'); resetMessages(); }} className="text-[12px] text-[#7adbb4] hover:underline">
                Back to login
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
