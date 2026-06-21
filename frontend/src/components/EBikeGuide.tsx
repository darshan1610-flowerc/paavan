'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface EBikeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const sections = [
  {
    number: '1',
    title: 'Key Functions',
    icon: '🔑',
    content: (
      <ul className="space-y-2 mt-2">
        {[
          { key: 'Oval Key', desc: 'Controls the Throttle' },
          { key: 'Square Key', desc: 'Powers the Battery' },
          { key: 'Round Key', desc: 'Engages the Lock' },
        ].map(({ key, desc }) => (
          <li key={key} className="flex items-start gap-2 text-[13px]">
            <span className="text-[#0F6E56] font-bold flex-shrink-0">•</span>
            <span><strong className="text-[#04342C]">{key}:</strong>{' '}
              <span className="text-[#5a7a6a]">{desc}</span>
            </span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    number: '2',
    title: 'Battery Indicators',
    icon: '🔋',
    content: (
      <p className="text-[13px] text-[#5a7a6a] mt-2 leading-relaxed">
        There are two battery voltage indicators. Please note that these are approximate and may not always be precise.
      </p>
    ),
  },
  {
    number: '3',
    title: 'Throttle Safety',
    icon: '⚡',
    content: (
      <p className="text-[13px] text-[#5a7a6a] mt-2 leading-relaxed">
        The throttle will not engage if the brakes are pulled even slightly.{' '}
        <strong className="text-[#04342C]">Ensure brakes are fully released</strong> before using the throttle.
      </p>
    ),
  },
  {
    number: '4',
    title: 'Lights & Horn',
    icon: '💡',
    content: (
      <p className="text-[13px] text-[#5a7a6a] mt-2 leading-relaxed">
        The switch for the light and horn is located on the <strong className="text-[#04342C]">left side of the handlebar</strong>.
      </p>
    ),
  },
  {
    number: '5',
    title: 'Pedal Assist System (PAS)',
    icon: '🚴',
    content: (
      <ul className="space-y-2 mt-2">
        {[
          'The e-bike features a Pedal Assist Sensor (PAS) that detects when you\'re pedaling and provides motor assistance.',
          'There are 3 levels of Pedal Assist, adjustable using the switch on the left handlebar.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px]">
            <span className="text-[#0F6E56] font-bold flex-shrink-0">•</span>
            <span className="text-[#5a7a6a]">{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    number: '6',
    title: 'Cruise Control Mode',
    icon: '🎯',
    content: (
      <ul className="space-y-2 mt-2">
        {[
          'After maintaining a constant speed for 8 seconds, Cruise Control activates automatically, locking the speed for a more effortless ride.',
          'To exit Cruise Control, simply use the throttle, start pedaling, or apply the brakes.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px]">
            <span className="text-[#0F6E56] font-bold flex-shrink-0">•</span>
            <span className="text-[#5a7a6a]">{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    number: '7',
    title: 'Charging Instructions',
    icon: '🔌',
    content: (
      <ul className="space-y-2 mt-2">
        {[
          'When plugging in or unplugging the charger, always switch the battery to "0" first, then to "1" after connecting or disconnecting.',
          'This ensures safe operation and helps prevent minor electrical shocks.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px]">
            <span className="text-[#0F6E56] font-bold flex-shrink-0">•</span>
            <span className="text-[#5a7a6a]">{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
];

export default function EBikeGuide({ isOpen, onClose }: EBikeGuideProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(modalRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out', delay: 0.05 });
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, { y: 20, opacity: 0, duration: 0.2, ease: 'power2.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in', delay: 0.05, onComplete: onClose });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-[600px] max-h-[90vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e8f0e8] flex-shrink-0">
          <div>
            <h2 className="font-display text-[22px] text-[#04342C]">E-Bike Usage Guide</h2>
            <p className="text-[12px] text-[#7a9080] mt-0.5">Everything you need to ride safely</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#9ab09a] hover:text-[#04342C] hover:bg-[#f0f5f0] transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {sections.map((section) => (
            <div
              key={section.number}
              className="bg-[#F4FAF1] border border-[#e0eee0] rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-7 h-7 bg-[#0F6E56] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[11px] font-bold">{section.number}</span>
                </div>
                <span className="text-[15px] font-bold text-[#04342C]">
                  {section.icon} {section.title}
                </span>
              </div>
              {section.content}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e8f0e8] flex-shrink-0">
          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-[#0F6E56] text-white text-[13px] font-bold rounded-[8px] hover:bg-[#085041] active:scale-[0.98] transition-all"
          >
            Got it, ready to ride →
          </button>
        </div>
      </div>
    </div>
  );
}
