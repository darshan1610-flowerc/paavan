import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'daily';
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    location: 'IIT BOMBAY',
    date: '',
    time: '',
    plan: initialPlan,
    name: '',
    email: '',
  });

  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    if (e.target.name === 'aadhaar') {
      setFormData({ ...formData, aadhaar: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Processing your booking...' });
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      const response = await fetch('https://paavan-backend.onrender.com/api/bookings', {
        method: 'POST',
        body: data,
      });
      
      if (response.ok) {
        setStatus({ type: 'success', message: 'Booking confirmed successfully! Redirecting to select a model...' });
        setTimeout(() => navigate('/models'), 2000);
      } else {
        setStatus({ type: 'error', message: 'Failed to confirm booking. Please try again.' });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Network error. Make sure the backend server is running.' });
    }
  };

  return (
    <div className="pt-32 pb-32">
      <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-lg">
          <h1 className="font-display-lg-mobile md:font-headline-lg text-display-lg-mobile md:text-headline-lg mb-xs">
            Reserve Your <span className="text-primary bg-secondary/20 px-4 rounded-xl">Ride</span>
          </h1>
          <div className="h-1 w-24 bg-primary mx-auto rounded-full shadow-[0_0_8px_rgba(4,94,76,0.3)]"></div>
          <p className="text-on-surface-variant mt-sm max-w-2xl mx-auto">
            Complete the form below to lock in your ride. Our smart lock technology ensures your bike will be waiting and ready exactly when you need it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
          {/* Booking Form */}
          <div className="glass-panel p-lg rounded-xl neon-glow-hover">
            <h2 className="font-headline-md text-headline-md mb-lg flex items-center gap-base">
              <span className="material-symbols-outlined text-primary bg-secondary/20 p-2 rounded-lg">assignment</span>
              Booking Details
            </h2>
            
            {status.message && (
              <div className={`p-md mb-lg rounded-lg border flex items-center gap-base ${status.type === 'success' ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-error/10 border-error/30 text-error'}`}>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>
                  {status.type === 'success' ? 'check_circle' : (status.type === 'loading' ? 'hourglass_empty' : 'error')}
                </span>
                <p className="font-label-md">{status.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div>
                  <label className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-base block">Full Name</label>
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-surface-container border-b-2 border-outline-variant focus:border-secondary transition-colors p-md text-on-surface focus:outline-none rounded-t-lg" type="text" placeholder="John Doe" />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-base block">Email Address</label>
                  <input required name="email" value={formData.email} onChange={handleChange} className="w-full bg-surface-container border-b-2 border-outline-variant focus:border-secondary transition-colors p-md text-on-surface focus:outline-none rounded-t-lg" type="email" placeholder="john@example.com" />
                </div>
              </div>

              <div>
                <label className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-base block">Plan Type</label>
                <div className="relative">
                  <select name="plan" value={formData.plan} onChange={handleChange} className="w-full bg-surface-container border-b-2 border-outline-variant focus:border-secondary transition-colors p-md text-on-surface appearance-none focus:outline-none rounded-t-lg">
                    <option value="daily">Daily Access (₹99/day)</option>
                    <option value="weekly">Weekly Pass (₹69/day)</option>
                    <option value="monthly">Monthly Elite (₹39/day)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>

              <div>
                <label className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-base block">Pickup Location</label>
                <div className="relative">
                  <select name="location" value={formData.location} onChange={handleChange} className="w-full bg-surface-container border-b-2 border-outline-variant focus:border-secondary transition-colors p-md text-on-surface appearance-none focus:outline-none rounded-t-lg">
                    <option>IIT BOMBAY</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-base block">Select Date</label>
                  <input required name="date" value={formData.date} onChange={handleChange} className="w-full bg-surface-container border-b-2 border-outline-variant focus:border-secondary transition-colors p-md text-on-surface focus:outline-none rounded-t-lg" type="date" />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-base block">Select Time</label>
                  <input required name="time" value={formData.time} onChange={handleChange} className="w-full bg-surface-container border-b-2 border-outline-variant focus:border-secondary transition-colors p-md text-on-surface focus:outline-none rounded-t-lg" type="time" />
                </div>
              </div>

              <div>
                <label className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-base block">Upload Aadhaar Card (Required)</label>
                <div className="w-full border-2 border-dashed border-outline-variant rounded-xl p-md flex flex-col items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer relative mt-base">
                  <input required type="file" name="aadhaar" onChange={handleChange} accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <span className="material-symbols-outlined text-[32px] text-primary mb-xs">upload_file</span>
                  <span className="font-label-sm text-on-surface-variant text-center">Tap to attach Aadhaar document</span>
                </div>
              </div>

              <div className="pt-lg">
                <button type="submit" disabled={status.type === 'loading'} className="w-full py-md rounded-xl bg-primary text-on-primary font-label-md uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100">
                  {status.type === 'loading' ? 'Confirming...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>

          {/* Features Bento */}
          <div className="grid grid-cols-2 gap-md">
            <div className="glass-panel p-md rounded-xl flex flex-col items-center justify-center text-center hover:bg-primary/5 transition-colors">
              <span className="material-symbols-outlined text-primary text-[40px] mb-base" style={{fontVariationSettings: "'FILL' 1"}}>battery_charging_full</span>
              <h4 className="font-label-md text-label-md uppercase tracking-wider text-primary">Removable Battery</h4>
            </div>
            <div className="glass-panel p-md rounded-xl flex flex-col items-center justify-center text-center hover:bg-primary/5 transition-colors">
              <span className="material-symbols-outlined text-primary text-[40px] mb-base" style={{fontVariationSettings: "'FILL' 1"}}>support_agent</span>
              <h4 className="font-label-md text-label-md uppercase tracking-wider text-primary">24/7 Support</h4>
            </div>
            <div className="col-span-2 glass-panel p-md rounded-xl flex items-center gap-md hover:bg-primary/5 transition-colors">
              <div className="p-md bg-secondary/20 rounded-full">
                <span className="material-symbols-outlined text-primary text-[32px]" style={{fontVariationSettings: "'FILL' 1"}}>lock_open</span>
              </div>
              <div>
                <h4 className="font-label-md text-label-md uppercase tracking-wider text-primary">Smart Lock Technology</h4>
                <p className="text-on-surface-variant font-label-sm">Keyless entry via Paavan Mobile App</p>
              </div>
            </div>
            <div className="col-span-2 glass-panel p-md rounded-xl flex items-center gap-md hover:bg-primary/5 transition-colors">
              <div className="p-md bg-secondary/20 rounded-full">
                <span className="material-symbols-outlined text-primary text-[32px]" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
              </div>
              <div>
                <h4 className="font-label-md text-label-md uppercase tracking-wider">Ride Insurance Included</h4>
                <p className="text-on-surface-variant font-label-sm">Fully covered against accidents & theft</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Booking;
