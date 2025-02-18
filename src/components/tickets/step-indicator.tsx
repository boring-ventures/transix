import { Step } from "../../app/dashboard/tickets/sales/types";

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="relative mb-8">
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200" />
      <div className="relative flex justify-between">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white
                ${
                  step.number <= currentStep
                    ? "border-primary text-primary"
                    : "border-gray-200 text-gray-400"
                }`}
            >
              {step.number}
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                step.number <= currentStep ? "text-primary" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
