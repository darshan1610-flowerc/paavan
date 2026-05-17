import { useNavigate } from 'react-router-dom';

const Models = () => {
  const navigate = useNavigate();
  
  const models = [
    {
      name: "Geekay",
      features: ["Dual Disc Brakes", "Range available: 16kms", "Size available: 26"],
      color: "bg-surface-container",
      image: "geekay.png"
    },
    {
      name: "Mach City",
      features: ["Power Brakes", "Size available: 26", "Range available: 48kms"],
      color: "bg-surface-container-high",
      image: "mach-city.png"
    },
    {
      name: "Urban Terrain",
      features: ["Light/Horn", "Pedal Assist Sensor", "Size Available: 26", "Range Available: 32kms", "Carrier Available"],
      color: "bg-surface-container",
      image: "urban-terrain.png"
    },
    {
      name: "Raleigh",
      features: ["Power Brakes", "Size: 26", "Range: 16kms"],
      color: "bg-surface-container-high",
      image: "raleigh.png"
    },
    {
      name: "Schnell",
      features: ["Dual Disc Brakes", "Size: 26", "Range: 16kms"],
      color: "bg-surface-container",
      image: "schnell.png"
    }
  ];

  return (
    <div className="pt-32 pb-32 min-h-screen px-margin-mobile md:px-margin-desktop">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-headline-lg text-headline-lg mb-lg text-on-surface text-center">Available Models</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {models.map((model, index) => (
            <div key={index} className={`glass-panel p-lg rounded-2xl shadow-lg border border-outline/30 flex flex-col items-center justify-between ${model.color}`}>
              {/* Image */}
              <div className="w-full h-48 bg-surface rounded-xl mb-md flex items-center justify-center border-2 border-outline-variant overflow-hidden">
                <img 
                  src={`/${model.image}`} 
                  alt={model.name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = `https://placehold.co/600x400/e8f5e1/045e4c?text=${model.name.replace(' ', '+')}`;
                  }}
                />
              </div>
              
              <h2 className="font-headline-md text-on-surface mb-sm w-full text-center">{model.name}</h2>
              <ul className="w-full space-y-xs mb-md">
                {model.features.map((feature, i) => (
                  <li key={i} className="font-body-md text-on-surface-variant flex items-center gap-xs">
                    <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button onClick={() => navigate('/guide')} className="w-full py-sm rounded-lg bg-primary text-on-primary font-bold uppercase tracking-widest hover:opacity-90 transition-all">
                Select Model
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Models;
