import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AttachId = () => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      navigate('/terms');
    } else {
      alert("Please upload your Aadhar Card");
    }
  };

  return (
    <div className="pt-32 pb-32 min-h-screen flex items-center justify-center bg-background">
      <div className="glass-panel p-xl rounded-2xl w-full max-w-md shadow-lg border border-outline/30 bg-surface">
        <h1 className="font-headline-lg text-headline-lg mb-md text-on-surface text-center">Identity Proof</h1>
        <p className="text-on-surface-variant mb-lg text-center font-body-md">Please attach your Aadhar Card for verification.</p>
        
        <form onSubmit={handleSubmit} className="space-y-lg flex flex-col items-center">
          <div className="w-full border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept="image/*,.pdf" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="material-symbols-outlined text-[48px] text-secondary mb-md">upload_file</span>
            <span className="font-label-md text-on-surface font-bold">
              {file ? file.name : "Tap to upload Aadhar Card"}
            </span>
          </div>
          
          <button type="submit" className="w-full py-md rounded-xl bg-primary text-on-primary font-bold uppercase tracking-widest hover:opacity-90 transition-all">
            Submit ID
          </button>
        </form>
      </div>
    </div>
  );
};

export default AttachId;
