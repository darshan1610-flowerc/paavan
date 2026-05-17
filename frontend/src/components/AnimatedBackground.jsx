const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" style={{ perspective: '1000px' }}>
      <div className="absolute top-[10%] left-[10%] text-secondary opacity-10 animate-float-3d-1">
        <span className="material-symbols-outlined text-[120px]" style={{fontVariationSettings: "'FILL' 1"}}>electric_bike</span>
      </div>
      <div className="absolute top-[20%] right-[15%] text-primary opacity-5 animate-float-3d-2">
        <span className="material-symbols-outlined text-[150px]" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
      </div>
      <div className="absolute bottom-[20%] left-[20%] text-secondary opacity-10 animate-float-3d-3">
        <span className="material-symbols-outlined text-[100px]" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
      </div>
      <div className="absolute bottom-[10%] right-[10%] text-primary opacity-5 animate-float-3d-1">
        <span className="material-symbols-outlined text-[140px]" style={{fontVariationSettings: "'FILL' 1"}}>speed</span>
      </div>
      <div className="absolute top-[50%] left-[5%] text-secondary opacity-5 animate-float-3d-2">
        <span className="material-symbols-outlined text-[90px]" style={{fontVariationSettings: "'FILL' 1"}}>battery_charging_full</span>
      </div>
      <div className="absolute top-[40%] right-[5%] text-primary opacity-5 animate-float-3d-3">
        <span className="material-symbols-outlined text-[110px]" style={{fontVariationSettings: "'FILL' 1"}}>ev_station</span>
      </div>
    </div>
  );
};

export default AnimatedBackground;
