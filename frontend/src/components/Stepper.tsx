import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Entity & Eligibility', number: 1 },
  { label: 'Financials & Impact', number: 2 },
  { label: 'Documents', number: 3 },
];

interface StepperProps {
  currentStep: number;
}

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, idx) => {
        const done = currentStep > step.number;
        const active = currentStep === step.number;
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {done ? <Check size={18} /> : step.number}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  active ? 'text-[#1E3A8A]' : done ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-24 h-1 mx-2 mb-5 transition-colors ${
                  currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
