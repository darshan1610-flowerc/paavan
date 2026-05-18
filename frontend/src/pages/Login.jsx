import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', otp: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [otpStep, setOtpStep] = useState(false); // false = enter details, true = enter OTP
  const navigate = useNavigate();

  const BACKEND_URL = 'https://paavan-backend.onrender.com'; // Local: 'http://localhost:5000'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setStatus({ type: 'error', message: 'Name and phone are required' });
      return;
    }
    
    setStatus({ type: 'loading', message: 'Sending OTP...' });

    try {
      const response = await fetch(`${BACKEND_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: `OTP sent! ${data.mockOtp ? '(Mock OTP: ' + data.mockOtp + ')' : ''}` });
        setOtpStep(true);
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send OTP' });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Network error. Make sure backend is running.' });
    }
  };

  const handleVerifyAndLogin = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setStatus({ type: 'error', message: 'OTP is required' });
      return;
    }

    setStatus({ type: 'loading', message: 'Verifying and logging in...' });

    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();

      if (response.ok) {
        if (data.existing) {
          setStatus({ type: 'info', message: 'Welcome back! Proceeding...' });
        } else {
          setStatus({ type: 'success', message: 'Successfully registered! Proceeding...' });
        }
        setTimeout(() => navigate('/home'), 2000);
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to login' });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Network error. Make sure backend is running.' });
    }
  };

  return (
    <div className="pt-32 pb-32 min-h-screen flex items-center justify-center px-margin-mobile">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
        
        {/* Cinematic Rotating EV Cycle */}
        <div className="flex flex-col items-center justify-center perspective-[1000px] mb-lg md:mb-0">
          <div className="relative w-full max-w-[250px] md:max-w-[400px] aspect-square flex items-center justify-center">
            <div className="absolute inset-0 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
            <img 
              src="/hero_bike.png" 
              alt="PAAVAN Go Electric Cycle" 
              className="w-full h-auto object-contain animate-spin-y drop-shadow-2xl z-10"
              style={{ filter: 'drop-shadow(0px 20px 30px rgba(4,94,76,0.3))' }}
            />
          </div>
          <h2 className="font-headline-md md:font-headline-lg text-primary mt-sm md:mt-lg text-center font-bold tracking-tight">
            The Future of <br/>Campus Mobility
          </h2>
        </div>

        {/* Login Form */}
        <div className="glass-panel p-xl rounded-2xl w-full max-w-md shadow-2xl border border-outline/30 bg-surface/90 mx-auto">
          <h1 className="font-headline-lg text-headline-lg mb-md text-primary text-center font-bold">Welcome Back</h1>
          <p className="text-on-surface-variant mb-lg text-center font-body-md">Please log in to reserve your ride.</p>
          
          {status.message && (
            <div className={`p-md mb-lg rounded-lg border flex items-center gap-base ${
              status.type === 'success' ? 'bg-secondary/10 border-secondary/30 text-secondary' : 
              status.type === 'info' ? 'bg-primary/10 border-primary/30 text-primary' : 
              status.type === 'loading' ? 'bg-outline/10 border-outline/30 text-on-surface-variant' :
              'bg-error/10 border-error/30 text-error'
            }`}>
              <span className="font-label-md">{status.message}</span>
            </div>
          )}
          
          <form onSubmit={otpStep ? handleVerifyAndLogin : handleSendOtp} className="space-y-md">
            {!otpStep ? (
              <>
                <div>
                  <label className="font-label-sm uppercase text-on-surface-variant mb-base block">Full Name</label>
                  <input 
                    required 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full bg-surface-container border-b-2 border-outline-variant focus:border-secondary transition-colors p-md text-on-surface focus:outline-none rounded-t-lg" 
                    type="text" 
                    placeholder="Enter your name" 
                  />
                </div>
                <div>
                  <label className="font-label-sm uppercase text-on-surface-variant mb-base block">Phone Number</label>
                  <input 
                    required 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full bg-surface-container border-b-2 border-outline-variant focus:border-secondary transition-colors p-md text-on-surface focus:outline-none rounded-t-lg" 
                    type="tel" 
                    placeholder="Enter your phone number" 
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="font-label-sm uppercase text-on-surface-variant mb-base block">Enter OTP</label>
                <input 
                  required 
                  name="otp" 
                  value={formData.otp} 
                  onChange={handleChange} 
                  className="w-full bg-surface-container border-b-2 border-outline-variant focus:border-secondary transition-colors p-md text-on-surface focus:outline-none rounded-t-lg text-center tracking-widest text-lg font-bold" 
                  type="text" 
                  maxLength="4"
                  placeholder="• • • •" 
                />
                <button 
                  type="button" 
                  onClick={() => setOtpStep(false)}
                  className="text-primary text-sm mt-2 hover:underline"
                >
                  Change Phone Number
                </button>
              </div>
            )}
            <button type="submit" disabled={status.type === 'loading'} className="w-full mt-lg py-md rounded-xl bg-primary text-on-primary font-bold uppercase tracking-widest hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:scale-100">
              {status.type === 'loading' ? 'Processing...' : (otpStep ? 'Verify & Login' : 'Send OTP')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
