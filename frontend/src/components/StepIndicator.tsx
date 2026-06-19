interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center mb-8">
      {steps.map((step, i) => {
        const num = i + 1;
        const done = num < currentStep;
        const active = num === currentStep;

        return (
          <div key={i} className="flex items-center flex-shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`w-6 h-6 sm:w-[26px] sm:h-[26px] rounded-full border-2 flex items-center justify-center text-[10px] font-semibold flex-shrink-0 transition-all ${
                  done
                    ? 'bg-[#0F6E56] border-[#0F6E56] text-white'
                    : active
                    ? 'border-[#0F6E56] text-[#0F6E56] bg-[#f0fbf7]'
                    : 'border-[#c8ddc8] text-[#9ab09a] bg-white'
                }`}
              >
                {done ? (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : num}
              </div>
              {/* Label: only show on sm and above to prevent overflow on mobile */}
              <span
                className={`hidden sm:inline text-[12px] whitespace-nowrap ${
                  done
                    ? 'text-[#0F6E56] font-semibold'
                    : active
                    ? 'text-[#04342C] font-bold'
                    : 'text-[#9ab09a]'
                }`}
              >
                {step.label}
              </span>
              {/* On mobile: show label only for the active step */}
              {active && (
                <span className="sm:hidden text-[11px] font-bold text-[#04342C] whitespace-nowrap">
                  {step.label}
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className="w-4 sm:w-10 h-[1.5px] bg-[#cce0cc] mx-1 sm:mx-2 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}
