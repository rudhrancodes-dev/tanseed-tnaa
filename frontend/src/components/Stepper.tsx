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
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((step, idx) => {
        const done = currentStep > step.number;
        const active = currentStep === step.number;
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-semibold text-sm transition-all duration-300"
                style={
                  done
                    ? { background: 'linear-gradient(135deg, #4338CA, #3730A3)', color: '#fff', boxShadow: '0 4px 14px rgba(67,56,202,0.3)' }
                    : active
                    ? { background: '#1D1D1F', color: '#fff', boxShadow: '0 4px 14px rgba(29,29,31,0.2)' }
                    : { background: '#F0F0F5', color: '#9898A0' }
                }
              >
                {done ? <Check size={16} strokeWidth={2.5} /> : step.number}
              </div>
              <span
                className="mt-2.5 text-xs font-medium transition-colors duration-200"
                style={
                  active
                    ? { color: '#1D1D1F', fontWeight: 600 }
                    : done
                    ? { color: '#4338CA' }
                    : { color: '#9898A0' }
                }
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className="w-20 h-px mx-3 mb-5 transition-all duration-500"
                style={{
                  background:
                    currentStep > step.number
                      ? 'linear-gradient(90deg, #4338CA, #3730A3)'
                      : '#E5E5EA',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
