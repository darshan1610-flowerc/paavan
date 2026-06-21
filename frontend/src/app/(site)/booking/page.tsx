'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import StepIndicator from '@/components/StepIndicator';
import OTPModal from '@/components/OTPModal';
import Footer from '@/components/Footer';

gsap.registerPlugin(useGSAP);

const STEPS = [
  { label: 'Select bike' },
  { label: 'Choose plan' },
  { label: 'Details' },
  { label: 'Payment' },
];

interface StoredBike { name: string; price: number }
interface StoredPlan { name: string; price: number; duration: string }


export default function BookingPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  const [showOTP, setShowOTP] = useState(true);
  const [isReturning, setIsReturning] = useState(false);
  const [phone, setPhone] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [fileUploaded, setFileUploaded] = useState<string | null>(null);

  const [bike, setBike] = useState<StoredBike | null>(null);
  const [plan, setPlan] = useState<StoredPlan | null>(null);

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [startDate, setStartDate] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const b = localStorage.getItem('paavan_bike');
    const p = localStorage.getItem('paavan_plan');
    if (b) setBike(JSON.parse(b));
    if (p) setPlan(JSON.parse(p));
  }, []);

  useGSAP(
    () => {
      if (!showOTP) {
        gsap.from('.form-section', {
          y: 30,
          opacity: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power3.out',
        });
      }
    },
    { scope: formRef, dependencies: [showOTP] }
  );

  const handleVerified = (returning: boolean, verifiedPhone: string) => {
    setIsReturning(returning);
    setPhone(verifiedPhone);
    setShowOTP(false);

    const storedName = localStorage.getItem('userName');
    const storedDob = localStorage.getItem('userDob');
    if (storedName) setFullName(storedName);
    if (storedDob) setDob(storedDob);
  };

  const aadhaarAlreadyVerified = typeof window !== 'undefined'
    ? localStorage.getItem('aadhaarVerified') === 'true'
    : false;

  const total = (plan?.price ?? 0) + 1010;

  const handlePayment = async () => {
    if (!startDate) {
      setErrorMsg('Please select a rental start date');
      return;
    }
    if (!fullName || !dob) {
      setErrorMsg('Please enter your full name and date of birth');
      return;
    }
    if (!aadhaarAlreadyVerified && !aadhaarFile) {
      setErrorMsg('Please upload your Aadhaar card');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('phone', phone);
      formData.append('bike', bike?.name || '');
      formData.append('plan', plan?.name || '');
      formData.append('date', startDate);
      formData.append('name', fullName);
      formData.append('dob', dob);
      formData.append('aadhaar_already_verified', aadhaarAlreadyVerified ? 'true' : 'false');
      if (!aadhaarAlreadyVerified && aadhaarFile) {
        formData.append('aadhaar', aadhaarFile);
      }

      const response = await fetch(`${backendUrl}/api/bookings`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('paavan_has_ride', 'true');
        localStorage.setItem(
          'paavan_active_ride',
          JSON.stringify({
            bookingId: data.bookingId,
            bookingRef: data.bookingRef,
            bike: bike?.name ?? 'Campus Rider',
            plan: plan?.name ?? 'Monthly',
            duration: plan?.duration ?? '30 days',
            total,
            name: fullName || 'You',
            startDate: new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          })
        );
        router.push('/payment');
      } else {
        setErrorMsg(data.error || 'Failed to submit booking');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error. Failed to submit booking to backend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">
      {showOTP && <OTPModal onVerified={handleVerified} />}

      <div ref={formRef} className="max-w-[660px] mx-auto px-6 py-10">
        <StepIndicator steps={STEPS} currentStep={3} />

        {/* Context */}
        <p className="text-[13px] text-[#7a9080] mb-6">
          {bike?.name && plan?.name ? (
            <>
              <span className="text-[#0F6E56] font-semibold">{bike.name}</span>
              {' · '}
              <span className="text-[#0F6E56] font-semibold">{plan.name}</span>
            </>
          ) : 'Complete your booking'}
        </p>

        <div className="bg-white border border-[#cce0cc] rounded-xl p-4 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">

          {/* ─── RETURNING CUSTOMER ─── */}
          {isReturning && !showOTP && (
            <div className="form-section mb-6">
              <div className="bg-[#EAF3DE] border border-[#b8d898] rounded-xl p-4 mb-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0F6E56] rounded-full flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0">
                  {fullName ? fullName[0].toUpperCase() : '👋'}
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[#04342C]">Welcome back{fullName ? `, ${fullName}` : ''}! 👋</div>
                  <div className="text-[12px] text-[#4a6a40]">Your details are saved. Just pick a start date.</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#9ab09a] tracking-wider uppercase mb-1.5">Full name</label>
                  <div className="w-full px-3.5 py-2.5 border border-[#e0eee0] rounded-[8px] text-[13px] text-[#1a2e1e] bg-[#F4FAF1]">
                    {fullName || '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9ab09a] tracking-wider uppercase mb-1.5">Phone</label>
                  <div className="w-full px-3.5 py-2.5 border border-[#e0eee0] rounded-[8px] text-[13px] text-[#1a2e1e] bg-[#F4FAF1]">
                    +91 {phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-3.5 py-2.5 border border-[#b8d898] rounded-[8px] bg-[#EAF3DE] mb-5">
                <span className="text-[12px] font-semibold text-[#04342C]">Aadhaar status</span>
                <span className="text-[12px] font-bold text-[#0F6E56]">✓ Verified</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#9ab09a] tracking-wider uppercase mb-1.5">Rental start date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#cce0cc] rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/10 transition-all"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          )}

          {/* ─── NEW CUSTOMER ─── */}
          {!isReturning && !showOTP && (
            <div className="form-section mb-6">
              <h2 className="font-display text-[22px] text-[#04342C] mb-4">Your booking details</h2>

              <div className="text-[10px] font-bold text-[#9ab09a] tracking-wider uppercase mb-3">Personal details</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="sm:col-span-1">
                  <label className="block text-[12px] font-semibold text-[#5a7060] mb-1.5">Full name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#cce0cc] rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/10 transition-all"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[12px] font-semibold text-[#5a7060] mb-1.5">Phone number</label>
                  <div className="w-full px-3.5 py-2.5 border border-[#e0eee0] rounded-[8px] text-[13px] text-[#1a2e1e] bg-[#F4FAF1]">
                    +91 {phone}
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[12px] font-semibold text-[#5a7060] mb-1.5">Date of birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#cce0cc] rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/10 transition-all"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[12px] font-semibold text-[#5a7060] mb-1.5">Rental start date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#cce0cc] rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/10 transition-all"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Aadhaar upload / verified badge */}
              <div className="mt-1">
                <div className="text-[10px] font-bold text-[#9ab09a] tracking-wider uppercase mb-2">Aadhaar card</div>
                {aadhaarAlreadyVerified ? (
                  <div className="flex items-center gap-3 px-4 py-3.5 bg-[#EAF3DE] border border-[#b8d898] rounded-[8px]">
                    <div className="w-8 h-8 bg-[#0F6E56] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 stroke-white fill-none" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#085041]">Aadhaar already verified</div>
                      <div className="text-[11px] text-[#4a6a40]">No upload needed — your ID was verified on your previous ride.</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <label
                      className={`border-2 border-dashed rounded-[8px] p-5 text-center cursor-pointer transition-all block ${
                        fileUploaded
                          ? 'border-[#0F6E56] bg-[#eaf8f0]'
                          : 'border-[#cce0cc] bg-[#F4FAF1] hover:border-[#0F6E56] hover:bg-[#eaf8f0]'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAadhaarFile(file);
                            setFileUploaded(file.name);
                          }
                        }}
                      />
                      <svg className="w-7 h-7 stroke-[#1D9E75] fill-none mx-auto mb-2" strokeWidth="1.6" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {fileUploaded ? (
                        <div className="text-[13px] font-semibold text-[#0F6E56]">✓ {fileUploaded}</div>
                      ) : (
                        <>
                          <div className="text-[13px] font-semibold text-[#085041]">Upload Aadhaar card</div>
                          <div className="text-[11px] text-[#7a9080] mt-1">PDF or image · Front &amp; back</div>
                        </>
                      )}
                    </label>
                    <div className="mt-2.5 bg-[#FAEEDA] border border-[#f0c060] rounded-[8px] p-3 text-[11px] text-[#854F0B] font-medium leading-relaxed">
                      ⚠️ <strong>Important:</strong> Your Aadhaar will be verified on bike return before releasing
                      your ₹1,000 deposit. Upload clear, valid documents only. Fake documents = deposit forfeiture
                      + permanent ban.
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─── DEPOSIT BOX ─── */}
          {!showOTP && (
            <div className="form-section">
              <div className="bg-[#EAF3DE] border border-[#b8d898] rounded-[10px] p-4 mb-5">
                <div className="text-[13px] font-bold text-[#085041] mb-1.5">💰 Refundable security deposit — ₹1,000</div>
                <div className="text-[12px] text-[#4a6a40] leading-relaxed">
                  Collected at booking. <strong>Fully refunded within 24 hours</strong> of returning the bike,
                  provided the bike is in the same condition and you submit a short video showing no damages.
                </div>
              </div>

              {/* Order summary */}
              <div className="text-[10px] font-bold text-[#5a7a6a] tracking-wider uppercase mb-3">Order summary</div>
              <div className="space-y-0 divide-y divide-[#f0f5f0]">
                {[
                  { label: 'Bike model', value: bike?.name ?? '—' },
                  { label: 'Plan', value: plan ? `${plan.name} (${plan.duration})` : '—' },
                  { label: 'Rental cost', value: plan ? `₹${plan.price.toLocaleString('en-IN')}` : '—' },
                  { label: 'Security deposit', value: '₹1,000 (refundable)' },
                  { label: 'Platform fee', value: '₹10' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2.5 text-[13px]">
                    <span className="text-[#4a6054] font-medium">{label}</span>
                    <span className="text-[#04342C] font-semibold">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 text-[15px] font-bold">
                  <span className="text-[#04342C]">Total payable now</span>
                  <span className="text-[#0F6E56]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Terms */}
              <div className="mt-4 mb-4">
                <div className="text-[10px] font-bold text-[#5a7a6a] tracking-wider uppercase mb-2">Terms &amp; conditions</div>
                <div className="bg-[#F4FAF1] rounded-[8px] p-3.5 text-[11px] text-[#3d5a45] leading-[1.9] max-h-[120px] overflow-y-auto mb-3">
                  <ol className="list-decimal list-outside pl-4 space-y-1.5">
                    <li>The Rider shall pay the applicable rent/fees to Paavan within 24 hours of completion of the rental period, beginning from the date the Vehicle was first rented. Failure to do so will result in a late fee of ₹249 per day.</li>
                    <li>The Rider shall deposit an amount of ₹1,000 with Paavan at the time of renting the Vehicle. This deposit will be refunded to the Rider upon return of the Vehicle in its original condition, subject to inspection by Paavan.</li>
                    <li>The Rider must comply with all applicable traffic laws and other regulations in force during the rental period. Paavan shall not be held liable for any violations committed by the Rider while using the Vehicle or availing Paavan's services.</li>
                    <li>The Rider must report any accident, crash, damage, personal injury, or theft/loss of the Vehicle to Paavan as soon as possible. In the event of personal injury, property damage, or theft, the Rider must file a report with the local police department within 24 hours. The Rider shall be solely responsible for any misuse, consequences, claims, demands, causes of action, losses, liabilities, damages, injuries, costs, and expenses of any kind or nature arising from a damaged, stolen, or lost Vehicle.</li>
                    <li>The Rider agrees to return the Vehicle to Paavan in the same condition in which it was rented. The Rider shall indemnify Paavan for any damages to the Vehicle, loss of the Vehicle, or loss of use resulting from the Rider's misuse.</li>
                    <li>The Rider shall return the Vehicle to the same location from which it was picked up, i.e., Hostel 5, IIT Bombay, Students' Residential Zone, Powai, Mumbai, Maharashtra 400076. If the Rider fails to return the Vehicle to this location and instead leaves it elsewhere, the Rider shall be liable to pay a penalty of ₹30 per kilometer, calculated based on the distance between the actual drop-off location and the designated return location.</li>
                    <li>The Rider confirms that they have read and understood these Terms and Conditions and have willingly consented to all clauses, including providing any necessary identification documents, without any force or coercion.</li>
                    <li>In the event of any technical faults or issues with the Vehicle, Paavan will, subject to availability, provide a replacement e-bike to the Rider.</li>
                    <li>If a replacement e-bike is not available, the Rider shall be entitled to a refund for the number of days the Vehicle remained non-operational. Alternatively, the Rider may choose to return the Vehicle and receive a proportional refund for the remaining duration of the rental period.</li>
                    <li>Paavan reserves the right to exchange the currently rented Vehicle with an alternative unit or to recall the Vehicle under specific circumstances. In such cases, the Rider will receive a refund corresponding to the unused portion of the rental term.</li>
                  </ol>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 accent-[#0F6E56]"
                  />
                  <span className="text-[13px] text-[#04342C]">I have read and agree to the terms &amp; conditions</span>
                </label>
              </div>

              {errorMsg && <div className="mb-4 text-[13px] font-semibold text-[#A32D2D]">{errorMsg}</div>}

              <button
                onClick={handlePayment}
                disabled={!agreedTerms || submitting}
                className="w-full py-3.5 bg-[#0F6E56] text-white text-[14px] font-bold rounded-[8px] hover:bg-[#085041] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(15,110,86,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {submitting ? 'Registering booking...' : 'Proceed to payment →'}
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
