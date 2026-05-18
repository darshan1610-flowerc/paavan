import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  const handleAccept = () => {
    localStorage.setItem('termsAccepted', 'true');
    navigate('/feedback'); // Make sure they fill the feedback later
  };

  return (
    <div className="pt-32 pb-32 min-h-screen flex items-center justify-center px-margin-mobile md:px-margin-desktop">
      <div className="glass-panel p-xl rounded-2xl w-full max-w-3xl shadow-lg border border-outline/30 bg-surface/90">
        <h1 className="font-headline-lg text-headline-lg mb-md text-on-surface text-center">Terms and Conditions</h1>
        
        <div className="text-on-surface-variant font-body-md space-y-md max-h-[60vh] overflow-y-auto pr-4 mb-lg text-justify">
          <p>1. The Rider shall pay the applicable rent/fees to Paavan within 24 hours of completion of the rental period, beginning from the date the Vehicle was first rented. Failure to do so will result in a late fee of 249 per day.</p>
          <p>2. The Rider shall deposit an amount of ₹1,000 with Paavan at the time of renting the Vehicle. This deposit will be refunded to the Rider upon return of the Vehicle in its original condition, subject to inspection by Paavan.</p>
          <p>3. The Rider must comply with all applicable traffic laws and other regulations in force during the rental period. Paavan shall not be held liable for any violations committed by the Rider while using the Vehicle or availing Paavan's services.</p>
          <p>4. The Rider must report any accident, crash, damage, personal injury, or theft/loss of the Vehicle to Paavan as soon as possible. In the event of personal injury, property damage, or theft, the Rider must file a report with the local police department within 24 hours. The Rider shall be solely responsible for any misuse, consequences, claims, demands, causes of action, losses, liabilities, damages, injuries, costs, and expenses of any kind or nature arising from a damaged, stolen, or lost Vehicle.</p>
          <p>5. The Rider agrees to return the Vehicle to Paavan in the same condition in which it was rented. The Rider shall indemnify Paavan for any damages to the Vehicle, loss of the Vehicle, or loss of use resulting from the Rider's misuse.</p>
          <p>6. The Rider shall return the Vehicle to the same location from which it was picked up, i.e., Hostel 5, IIT Bombay, Students' Residential Zone, Powai, Mumbai, Maharashtra 400076. If the Rider fails to return the Vehicle to this location and instead leaves it elsewhere, the Rider shall be liable to pay a penalty of 30 per kilometer, calculated based on the distance between the actual drop-off location and the designated return location.</p>
          <p>7. The Rider confirms that they have read and understood these Terms and Conditions and have willingly consented to all clauses, including providing any necessary identification documents, without any force or coercion.</p>
          <p>8. In the event of any technical faults or issues with the Vehicle, Paavan will, subject to availability, provide a replacement e-bike to the Rider.</p>
          <p>9. If a replacement e-bike is not available, the Rider shall be entitled to a refund for the number of days the Vehicle remained non-operational. Alternatively, the Rider may choose to return the Vehicle and receive a proportional refund for the remaining duration of the rental period.</p>
          <p>10. Paavan reserves the right to exchange the currently rented Vehicle with an alternative unit or to recall the Vehicle under specific circumstances. In such cases, the Rider will receive a refund corresponding to the unused portion of the rental term.</p>
        </div>
        
        <button onClick={handleAccept} className="w-full py-md rounded-xl bg-primary text-on-primary font-bold uppercase tracking-widest hover:opacity-90 transition-all">
          I Accept the Terms and Conditions
        </button>
      </div>
    </div>
  );
};

export default Terms;
