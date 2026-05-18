import { useNavigate } from 'react-router-dom';

const Models = () => {
  const navigate = useNavigate();
  
  const models = [
    {
      name: "Mach City",
      features: ["Power Brakes", "Size available: 26", "Range available: 48kms"],
      color: "bg-surface-container",
      image: "mach_city.jpeg"
    },
    {
      name: "Geekay",
      features: ["Dual Disc Brakes", "Size available: 26", "Range available: 16kms"],
      color: "bg-surface-container-high",
      image: "geekay.jpeg"
    },
    {
      name: "Schnell",
      features: ["Dual Disc Brakes", "Size: 26", "Range: 16kms"],
      color: "bg-surface-container",
      image: "schnell.jpeg"
    },
    {
      name: "Urban Terrain",
      features: ["Light/Horn", "Pedal Assist Sensor", "Size Available: 26", "Range Available: 32kms", "Carrier Available"],
      color: "bg-surface-container-high",
      image: "urban_terrain.jpeg"
    },
    {
      name: "Raleigh",
      features: ["Power Brakes", "Size: 26", "Range: 16kms"],
      color: "bg-surface-container",
      image: "raleigh.jpeg"
    },
    {
      name: "Nebzee Black",
      features: ["Power Brakes", "Size available: 26", "Range: 16kms, 24kms, 32kms"],
      color: "bg-surface-container-high",
      image: "nebzee_black.jpeg"
    },
    {
      name: "Hero Hustle",
      features: ["21 Gears", "Front Suspension", "Dual Disc Brakes", "Size available: 29", "Range available: 48kms"],
      color: "bg-surface-container",
      image: "hero_hustle.jpeg"
    },
    {
      name: "Hero Winn",
      features: ["Dual Disc Brakes", "Light/Horn", "Pedal Assist Sensor", "350W motor", "Range Available: 35kms", "Most powerful of all"],
      color: "bg-surface-container-high",
      image: "hero_winn.jpeg"
    },
    {
      name: "Sturdy Axiro Red",
      features: ["Front Suspension", "Dual Disc Brakes", "Size available: 27.5", "Range: 16kms, 24kms, 32kms"],
      color: "bg-surface-container",
      image: "sturdy_axiro_red.jpeg"
    },
    {
      name: "Sturdy Tweak",
      features: ["Front suspension", "Dual disc brakes", "Light/Horn", "Size available: 27.5", "Range available: 32kms"],
      color: "bg-surface-container-high",
      image: "sturdy_tweak.jpeg"
    },
    {
      name: "Sturdy Axiro",
      features: ["Front suspension", "Dual disc brakes", "Alloy Rim", "Sizes available: 27.5, 29", "Range: 16kms, 24kms, 32kms"],
      color: "bg-surface-container",
      image: "sturdy_axiro.jpeg"
    },
    {
      name: "Nebzee Copper",
      features: ["Power Brakes", "Size available: 26", "Range: 16kms, 24kms, 32kms"],
      color: "bg-surface-container-high",
      image: "nebzee_copper.jpeg"
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
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
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
              
              <button onClick={() => {
                if (localStorage.getItem('termsAccepted') === 'true') {
                  navigate('/guide');
                } else {
                  navigate('/terms');
                }
              }} className="w-full py-sm rounded-lg bg-primary text-on-primary font-bold uppercase tracking-widest hover:opacity-90 transition-all">
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
