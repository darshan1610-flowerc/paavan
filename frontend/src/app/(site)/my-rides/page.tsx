'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Footer from '@/components/Footer';

gsap.registerPlugin(useGSAP);

interface Booking {
  id: string;
  booking_ref: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  rental_amount: number;
  deposit_amount: number;
  platform_fee: number;
  total_paid: number;
  bike: {
    name: string;
  };
  plan: {
    name: string;
    duration_days: number;
  };
  deposit: {
    status: 'held' | 'pending_review' | 'approved' | 'withheld';
    return_video_path?: string;
    submitted_at?: string;
    window_closes_at?: string;
    notes?: string;
  } | null;
}

export default function MyRidesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const userPhone = typeof window !== 'undefined' ? localStorage.getItem('userPhone') : null;
  const isLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') === 'true' : false;

  const fetchUserBookings = async () => {
    if (!userPhone) {
      setLoading(false);
      return;
    }
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/bookings/user/${userPhone}`);
      const data = await res.json();
      
      if (res.ok) {
        setBookings(data.bookings || []);
      } else {
        setErrorMsg(data.error || 'Failed to retrieve bookings.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [userPhone]);

  useGSAP(
    () => {
      if (!loading) {
        gsap.from('.rides-section', {
          y: 30,
          opacity: 0,
          stagger: 0.12,
          duration: 0.65,
          ease: 'power3.out',
          delay: 0.1,
        });
      }
    },
    { scope: containerRef, dependencies: [loading] }
  );

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setUploadError('Video file size exceeds 50MB limit.');
        return;
      }
      setVideoFile(file);
      setUploadError('');
      setUploadSuccess(false);
    }
  };

  const handleUploadVideo = async (bookingId: string) => {
    if (!videoFile) {
      setUploadError('Please select a video file to upload.');
      return;
    }
    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('video', videoFile);

      const res = await fetch(`${backendUrl}/api/deposits/submit-return`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit return video.');
      }

      setUploadSuccess(true);
      setVideoFile(null);
      await fetchUserBookings(); // Reload data to update deposit status
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Error uploading video.');
    } finally {
      setUploading(false);
    }
  };

  // Split bookings into active and history
  const activeBooking = bookings.find((b) => b.status === 'active');
  const historyBookings = bookings.filter((b) => b.status !== 'active');

  // Helper to calculate remaining days
  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const today = new Date();
    // Reset hours to compare dates accurately
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Helper to format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <main className="min-h-screen">
      <div ref={containerRef} className="max-w-[640px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-[30px] text-[#04342C]">My rides</h1>
          <p className="text-[13px] text-[#7a9080] mt-1">
            Your active bookings, deposit refund claims &amp; ride history
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#7a9080] text-[14px]">
            <svg className="w-8 h-8 animate-spin mx-auto stroke-[#0F6E56] fill-none mb-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading your rides...
          </div>
        ) : !isLoggedIn ? (
          <div className="rides-section bg-white border border-[#cce0cc] rounded-xl py-12 px-6 text-center shadow-sm">
            <div className="text-[16px] font-bold text-[#04342C] mb-2">Please log in first</div>
            <p className="text-[12px] text-[#7a9080] mb-6 max-w-[280px] mx-auto">
              You must verify your identity to view your bookings and manage your deposits.
            </p>
            <Link
              href="/booking"
              className="inline-block px-6 py-3 bg-[#0F6E56] text-white text-[13px] font-bold rounded-[8px] hover:bg-[#085041] transition-all"
            >
              Verify OTP / Log In
            </Link>
          </div>
        ) : errorMsg ? (
          <div className="rides-section bg-[#FCEBEB] border border-[#F5C2C2] text-[#A32D2D] rounded-xl p-5 text-center text-[13px]">
            {errorMsg}
          </div>
        ) : (
          <>
            {/* ─── ACTIVE RIDE ─── */}
            {activeBooking ? (
              <div className="rides-section bg-white border-2 border-[#0F6E56] rounded-xl p-6 mb-6 shadow-[0_4px_20px_rgba(15,110,86,0.10)]">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <div className="text-[16px] font-bold text-[#04342C]">
                      {activeBooking.bike?.name} · {activeBooking.plan?.name} Plan
                    </div>
                    <div className="text-[12px] text-[#7a9080] mt-1">
                      Booking #{activeBooking.booking_ref || activeBooking.id.slice(0, 8).toUpperCase()} · Started {formatDate(activeBooking.start_date)}
                    </div>
                  </div>
                  <span className="bg-[#EAF3DE] text-[#085041] text-[11px] font-bold px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                  {[
                    { value: String(getDaysRemaining(activeBooking.end_date)), label: 'Days left' },
                    { value: formatDate(activeBooking.end_date), label: 'Return by' },
                    { value: `₹${activeBooking.deposit_amount.toLocaleString('en-IN')}`, label: 'Security Deposit' },
                  ].map(({ value, label }) => (
                    <div key={label} className="bg-[#F4FAF1] rounded-[10px] p-2.5 sm:p-3">
                      <div className="text-[15px] sm:text-[18px] font-bold text-[#0F6E56] leading-tight break-words">{value}</div>
                      <div className="text-[10px] sm:text-[11px] text-[#7a9080] mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                {/* ─── DEPOSIT REFUND WORKFLOW ─── */}
                <div className="mt-5 border-t border-[#f0f5f0] pt-5">
                  <h3 className="text-[13px] font-bold text-[#04342C] mb-2">💰 Refundable Security Deposit</h3>

                  {(!activeBooking.deposit || activeBooking.deposit.status === 'held') && (
                    <div className="space-y-3">
                      <p className="text-[12px] text-[#5a7060] leading-relaxed">
                        Ready to return your e-bike? Bring the bike back to any PAAVAN operator point, record a short **10-15s condition video** showing no damages, and upload it here to request your deposit refund:
                      </p>

                      <div className="bg-[#F4FAF1] border-2 border-dashed border-[#cce0cc] rounded-lg p-4 text-center cursor-pointer hover:border-[#0F6E56] transition-all relative">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <svg className="w-8 h-8 stroke-[#0F6E56] fill-none mx-auto mb-2" strokeWidth="1.6" viewBox="0 0 24 24">
                          <path d="M23 7l-7 5 7 5V7z" />
                          <rect x="1" y="5" width="15" height="14" rx="2" />
                        </svg>
                        {videoFile ? (
                          <span className="text-[12px] font-bold text-[#0f6e56] block truncate">
                            ✓ {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)}MB)
                          </span>
                        ) : (
                          <>
                            <span className="text-[12px] font-bold text-[#085041] block">Choose condition video</span>
                            <span className="text-[10px] text-[#7a9080] block mt-0.5">MP4, MOV, or AVI up to 50MB</span>
                          </>
                        )}
                      </div>

                      {uploadError && <p className="text-[11px] font-semibold text-[#A32D2D]">{uploadError}</p>}
                      {uploadSuccess && <p className="text-[11px] font-semibold text-[#0F6E56]">✓ Return video submitted successfully!</p>}

                      <button
                        onClick={() => handleUploadVideo(activeBooking.id)}
                        disabled={uploading || !videoFile}
                        className="w-full py-2.5 bg-[#0F6E56] text-white text-[13px] font-bold rounded-[8px] hover:bg-[#085041] transition-all disabled:opacity-50"
                      >
                        {uploading ? 'Uploading Video & Requesting Refund...' : 'Upload Video & Claim Refund →'}
                      </button>
                    </div>
                  )}

                  {activeBooking.deposit?.status === 'pending_review' && (
                    <div className="bg-[#FAEEDA] border border-[#f0c060] rounded-lg p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[12px] font-bold text-[#854F0B]">Refund Claim Submitted</span>
                        <span className="text-[10px] bg-[#f0c060]/30 text-[#854F0B] font-bold px-2 py-0.5 rounded">Pending Review</span>
                      </div>
                      <p className="text-[11px] text-[#854F0B] leading-relaxed">
                        We have received your return video. Our campus operator is reviewing it for damage checks. Your ₹1,000 refund will be processed within **24 hours** from submission:
                        <br />
                        <strong className="block mt-1 font-semibold">Submitted: {new Date(activeBooking.deposit.submitted_at!).toLocaleString('en-IN')}</strong>
                      </p>
                    </div>
                  )}

                  {activeBooking.deposit?.status === 'approved' && (
                    <div className="bg-[#EAF3DE] border border-[#b8d898] rounded-lg p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[12px] font-bold text-[#085041]">✓ Refund Processed</span>
                        <span className="text-[10px] bg-[#0F6E56] text-white font-bold px-2 py-0.5 rounded">Approved</span>
                      </div>
                      <p className="text-[11px] text-[#4a6a40] leading-relaxed">
                        Your return video has been verified. The ₹1,000 security deposit has been fully refunded back to your payment account. It may take 1-3 business days to reflect in your bank account depending on Razorpay.
                      </p>
                    </div>
                  )}

                  {activeBooking.deposit?.status === 'withheld' && (
                    <div className="bg-[#FCEBEB] border border-[#F5C2C2] rounded-lg p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[12px] font-bold text-[#A32D2D]">&times; Refund Disputed</span>
                        <span className="text-[10px] bg-[#A32D2D] text-white font-bold px-2 py-0.5 rounded">Withheld</span>
                      </div>
                      <p className="text-[11px] text-[#A32D2D] leading-relaxed">
                        Your deposit refund has been put on hold due to identified bike damages or inspection issues.
                        <br />
                        {activeBooking.deposit.notes && (
                          <strong className="block mt-1">Operator Notes: {activeBooking.deposit.notes}</strong>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rides-section bg-white border border-[#cce0cc] rounded-xl py-14 px-6 text-center mb-6 shadow-sm">
                <svg className="w-14 h-14 stroke-[#cce0cc] fill-none mx-auto mb-3" strokeWidth="1.2" viewBox="0 0 24 24">
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <path d="M12 17.5V11l-3-3 3-4h4.5l2 4-4 1.5" />
                </svg>
                <div className="text-[16px] font-bold text-[#c8ddc8] mb-1">No active bookings</div>
                <div className="text-[12px] text-[#b0c8b0] mb-5 max-w-[280px] mx-auto">
                  Rent your PAAVAN e-bike now to commute easily across campus.
                </div>
                <Link
                  href="/bikes"
                  className="inline-block px-6 py-2.5 bg-[#0F6E56] text-white text-[13px] font-bold rounded-[8px] hover:bg-[#085041] transition-all"
                >
                  Rent E-Bike →
                </Link>
              </div>
            )}

            {/* ─── RIDE HISTORY ─── */}
            <div className="rides-section">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-[14px] font-bold text-[#04342C]">Ride history</div>
                <div className="flex-1 h-[1px] bg-[#e8f0e8]" />
              </div>

              {historyBookings.length > 0 ? (
                <div className="space-y-2.5">
                  {historyBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white border border-[#e8f0e8] rounded-xl px-4 sm:px-5 py-4 flex items-center justify-between gap-3 hover:border-[#cce0cc] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-[#F4FAF1] rounded-[10px] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 stroke-[#1D9E75] fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                            <circle cx="5.5" cy="17.5" r="3.5" />
                            <circle cx="18.5" cy="17.5" r="3.5" />
                            <path d="M12 17.5V11l-3-3 3-4h4.5l2 4-4 1.5" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] sm:text-[14px] font-semibold text-[#04342C] truncate">
                            {b.bike?.name} · {b.plan?.name}
                          </div>
                          <div className="text-[11px] sm:text-[12px] text-[#7a9080] mt-0.5">
                            {formatDate(b.start_date)} – {formatDate(b.end_date)} · ₹{b.total_paid.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#f0f5f0] text-[#7a9080] flex-shrink-0">
                        {b.status === 'completed' ? 'Completed' : 'Cancelled'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-[#e8f0e8] rounded-xl text-[#7a9080] text-[12px]">
                  No previous rides logged.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
