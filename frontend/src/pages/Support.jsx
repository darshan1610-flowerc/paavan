const Support = () => {
  return (
    <div className="pt-32 pb-32 min-h-[80vh] flex flex-col items-center justify-center">
      <section className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop w-full">
        <div className="glass-panel p-xl rounded-xl neon-glow-hover text-center">
          <span className="material-symbols-outlined text-secondary text-[64px] mb-md" style={{fontVariationSettings: "'FILL' 1"}}>support_agent</span>
          
          <h1 className="font-headline-lg text-headline-lg mb-sm text-on-surface">Support Center</h1>
          <div className="h-1 w-24 bg-secondary mx-auto rounded-full shadow-[0_0_8px_rgba(154,217,61,1)] mb-lg"></div>
          
          <p className="text-on-surface-variant text-body-lg mb-xl">
            For further queries please contact on following contact details:
          </p>
          
          <div className="bg-surface-container-highest/50 rounded-lg p-lg border border-secondary/20 inline-block text-left min-w-[300px]">
            <div className="mb-md">
              <p className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-xs">Contact Name</p>
              <p className="font-headline-md text-primary">Param Tank</p>
            </div>
            
            <div>
              <p className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-xs">Contact Number</p>
              <p className="font-headline-md text-primary">+91 6351 243 422</p>
            </div>
          </div>
          
          <div className="mt-xl flex items-center justify-center gap-xs text-secondary font-label-md">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>Available 24/7 for urgent ride assistance</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;
