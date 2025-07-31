"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneStep from "./steps/PhoneStep";
import CallTimeStep from "./steps/CallTimeStep";
import RemindersStep from "./steps/RemindersStep";
import SummaryStep from "./steps/SummaryStep";
import ClarityCalls from "./steps/ClarityCallsStep";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";


enum OnboardingStep {
  PHONE = 0,
  WANTS_CLARITY_CALLS = 1,
  CALL_TIME = 2,
  REMINDERS = 3,
  SUMMARY = 4,
  COMPLETED = 5,
}

export default function OnboardingForm() {
  const completeOnboarding = useMutation(api.user.completeOnboarding);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.PHONE);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    wantsClarityCalls: false,
    callTime: "",
    wantsCallReminders: false,
  });

  // Handle moving to the next step
  const handleNext = (step: OnboardingStep, data: Partial<typeof formData>) => {
    // Update the form data
    setFormData((prev) => ({ ...prev, ...data }));

    // Move to the next step
    setCurrentStep(step);
  };

  // Handle moving to the previous step
  const handleBack = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  // Handle completing the onboarding process
  const handleComplete = () => {
    // Redirect to the dashboard or home page
    // router.push("/");
  };

  // Render the current step
  const renderStep = () => {
    console.log(currentStep);
    switch (currentStep) {
      case OnboardingStep.PHONE:
        return (
          <PhoneStep
            initialValues={{ name: formData.name, phone: formData.phone }}
            onNext={(data) => handleNext(OnboardingStep.WANTS_CLARITY_CALLS, { name: data.name, phone: data.phone })}
          />
        );

      case OnboardingStep.WANTS_CLARITY_CALLS:
        return (
          <ClarityCalls
            initialValue={formData.wantsClarityCalls}
            onNext={(wantsClarityCalls) => handleNext(OnboardingStep.CALL_TIME, { wantsClarityCalls })}
            onBack={() => handleBack(OnboardingStep.PHONE)}
          />
        )
      case OnboardingStep.CALL_TIME:
        return (
          <CallTimeStep
            initialValue={formData.callTime}
            onNext={(callTime) => handleNext(OnboardingStep.REMINDERS, { callTime })}
            onBack={() => handleBack(OnboardingStep.PHONE)}
          />
        );
      case OnboardingStep.REMINDERS:
        return (
          <RemindersStep
            initialValue={formData.wantsCallReminders}
            onNext={(wantsCallReminders) => handleNext(OnboardingStep.SUMMARY, { wantsCallReminders })}
            onBack={() => handleBack(OnboardingStep.CALL_TIME)}
          />
        );
      case OnboardingStep.SUMMARY:
        return (
          <SummaryStep
            data={formData}
            onBack={() => handleBack(OnboardingStep.REMINDERS)}
            onComplete={handleComplete}
          />
        );
      case OnboardingStep.COMPLETED:
        return (
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4">Onboarding Complete!</h2>
            <p className="mb-6 text-gray-600">
              Thank you for completing the onboarding process. You will be redirected to the dashboard.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto mb-8">
        <div className="flex justify-between items-center">
          {[
            "Contact",
            "Clarity Calls",
            "Call Time",
            "Reminders",
            "Summary",
          ].map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStep
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-500"
                  }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-xs mt-1 ${index <= currentStep ? "text-blue-500" : "text-gray-500"
                  }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {renderStep()}
    </div>
  );
}