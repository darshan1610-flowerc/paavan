import { useNavigate } from 'react-router-dom';

const UsageGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-32 min-h-screen px-margin-mobile md:px-margin-desktop">
      <div className="max-w-4xl mx-auto glass-panel p-xl rounded-2xl shadow-lg border border-outline/30 bg-surface/90">
        <h1 className="font-headline-lg text-headline-lg mb-lg text-on-surface text-center">E-Bike Usage Guide</h1>
        
        <div className="text-on-surface-variant font-body-md space-y-lg">
          <section>
            <h2 className="font-headline-md text-on-surface mb-sm">1. Key Functions</h2>
            <ul className="list-disc list-inside space-y-xs ml-4">
              <li><strong>Oval Key:</strong> Controls the Throttle</li>
              <li><strong>Square Key:</strong> Powers the Battery</li>
              <li><strong>Round Key:</strong> Engages the Lock</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline-md text-on-surface mb-sm">2. Battery Indicators</h2>
            <p className="ml-4">There are two battery voltage indicators. Please note that these are approximate and may not always be precise.</p>
          </section>

          <section>
            <h2 className="font-headline-md text-on-surface mb-sm">3. Throttle Safety</h2>
            <p className="ml-4">The throttle will not engage if the brakes are pulled even slightly. Ensure brakes are fully released before using the throttle.</p>
          </section>

          <section>
            <h2 className="font-headline-md text-on-surface mb-sm">4. Lights & Horn</h2>
            <p className="ml-4">The switch for the light and horn is located on the left side of the handlebar.</p>
          </section>

          <section>
            <h2 className="font-headline-md text-on-surface mb-sm">5. Pedal Assist System (PAS)</h2>
            <ul className="list-disc list-inside space-y-xs ml-4">
              <li>The e-bike features a Pedal Assist Sensor (PAS) that detects when you're pedaling and provides motor assistance.</li>
              <li>There are 3 levels of Pedal Assist, adjustable using the switch on the left handlebar.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline-md text-on-surface mb-sm">6. Cruise Control Mode</h2>
            <ul className="list-disc list-inside space-y-xs ml-4">
              <li>After maintaining a constant speed for 8 seconds, Cruise Control activates automatically, locking the speed for a more effortless ride.</li>
              <li>To exit Cruise Control, simply use the throttle, start pedaling, or apply the brakes.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline-md text-on-surface mb-sm">7. Charging Instructions</h2>
            <ul className="list-disc list-inside space-y-xs ml-4">
              <li>When plugging in or unplugging the charger, always switch the battery to "0" first, then to "1" after connecting or disconnecting.</li>
              <li>This ensures safe operation and helps prevent minor electrical shocks.</li>
            </ul>
          </section>
        </div>

        <div className="mt-xl flex justify-center">
          <button onClick={() => navigate('/feedback')} className="w-full md:w-auto px-xl py-md rounded-xl bg-primary text-on-primary font-bold uppercase tracking-widest hover:opacity-90 hover:scale-105 transition-all shadow-lg">
            Proceed to Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsageGuide;
