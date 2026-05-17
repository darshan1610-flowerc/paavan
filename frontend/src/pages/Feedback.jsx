import { useState } from 'react';

const Feedback = () => {
  const [formData, setFormData] = useState({ name: '', email: '', rating: '5', comments: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your feedback!");
    setFormData({ name: '', email: '', rating: '5', comments: '' });
  };

  return (
    <div className="pt-32 pb-32 min-h-screen flex items-center justify-center px-margin-mobile md:px-margin-desktop">
      <div className="glass-panel p-xl rounded-2xl w-full max-w-2xl shadow-lg border border-outline/30 bg-surface/90">
        <h1 className="font-headline-lg text-headline-lg mb-md text-on-surface text-center">Feedback</h1>
        <p className="text-on-surface-variant mb-lg text-center font-body-md">We value your feedback. Let us know about your experience!</p>
        
        <form onSubmit={handleSubmit} className="space-y-md">
          <div>
            <label className="font-label-sm uppercase text-on-surface-variant mb-base block">Name</label>
            <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-surface-container border border-outline-variant focus:border-secondary transition-colors p-md text-on-surface focus:outline-none rounded-lg" type="text" placeholder="Your name" />
          </div>
          <div>
            <label className="font-label-sm uppercase text-on-surface-variant mb-base block">Email</label>
            <input required name="email" value={formData.email} onChange={handleChange} className="w-full bg-surface-container border border-outline-variant focus:border-secondary transition-colors p-md text-on-surface focus:outline-none rounded-lg" type="email" placeholder="Your email" />
          </div>
          <div>
            <label className="font-label-sm uppercase text-on-surface-variant mb-base block">Rating</label>
            <select name="rating" value={formData.rating} onChange={handleChange} className="w-full bg-surface-container border border-outline-variant focus:border-secondary transition-colors p-md text-on-surface focus:outline-none rounded-lg appearance-none">
              <option value="5">Excellent (5 Stars)</option>
              <option value="4">Good (4 Stars)</option>
              <option value="3">Average (3 Stars)</option>
              <option value="2">Poor (2 Stars)</option>
              <option value="1">Terrible (1 Star)</option>
            </select>
          </div>
          <div>
            <label className="font-label-sm uppercase text-on-surface-variant mb-base block">Comments</label>
            <textarea required name="comments" value={formData.comments} onChange={handleChange} className="w-full bg-surface-container border border-outline-variant focus:border-secondary transition-colors p-md text-on-surface focus:outline-none rounded-lg min-h-[100px]" placeholder="Tell us what you think..."></textarea>
          </div>
          <button type="submit" className="w-full mt-lg py-md rounded-xl bg-primary text-on-primary font-bold uppercase tracking-widest hover:opacity-90 transition-all">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
