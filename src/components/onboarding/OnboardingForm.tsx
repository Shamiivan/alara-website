"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhoneStep from "./steps/PhoneStep";
import CallTimeStep from "./steps/CallTimeStep";
import RemindersStep from "./steps/RemindersStep";
import SummaryStep from "./steps/SummaryStep";
import ClarityCalls from "./steps/ClarityCallsStep";

import { useMutation, useQuery } from "convex/react";
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
  const user = useQuery(api.user.getCurrentUser);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.PHONE);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    wantsClarityCalls: false,
    callTime: "",
    wantsCallReminders: false,
  });

  // Load user data and determine current step on mount
  useEffect(() => {
    if (user) {
      // Populate form data from existing user data
      const updatedFormData = {
        name: user.name || "",
        phone: user.phone || "",
        wantsClarityCalls: user.wantsClarityCalls || false,
        callTime: user.callTime || "",
        wantsCallReminders: user.wantsCallReminders || false,
      };

      setFormData(updatedFormData);

      // Determine current step based on available data
      let step = OnboardingStep.PHONE;

      if (updatedFormData.phone) {
        step = OnboardingStep.WANTS_CLARITY_CALLS;

        if (updatedFormData.wantsClarityCalls !== undefined) {
          step = OnboardingStep.CALL_TIME;

          if (updatedFormData.callTime) {
            step = OnboardingStep.REMINDERS;

            if (updatedFormData.wantsCallReminders !== undefined) {
              step = OnboardingStep.SUMMARY;
            }
          }
        }
      }

      setCurrentStep(step);
      setIsLoading(false);
    }
  }, [user]);

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
  const handleComplete = async () => {
    try {
      setIsSaving(true);

      // Save all data to the database
      await completeOnboarding({
        name: formData.name,
        phoneNumber: formData.phone,
        wantsClarityCalls: formData.wantsClarityCalls,
        callTime: formData.callTime,
        wantsCallReminders: formData.wantsCallReminders,
      });

      // Show completion step briefly
      setCurrentStep(OnboardingStep.COMPLETED);

      // Redirect to payment page after a short delay
      setTimeout(() => {
        router.push("/payment");
      }, 1500);

    } catch (error) {
      console.error("Error completing onboarding:", error);
      // Could show an error message here
    } finally {
      setIsSaving(false);
    }
  };

  // Render the current step
  const renderStep = () => {
    if (isLoading) {
      return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your progress...</p>
        </div>
      );
    }

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
            onBack={() => handleBack(OnboardingStep.WANTS_CLARITY_CALLS)}
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
            isSaving={isSaving}
          />
        );
      case OnboardingStep.COMPLETED:
        return (
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
            <div className="mb-4 text-green-500">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Onboarding Complete!</h2>
            <p className="mb-6 text-gray-600">
              Thank you for completing the onboarding process. You will be redirected to payment.
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-blue-200 rounded"></div>
            </div>
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
                className={`w-8 h-8 rounded-full flex items-center justify-center ${isLoading
                    ? "bg-gray-200 text-gray-500"
                    : index <= currentStep
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
              >
                {isLoading ? (
                  <div className="animate-pulse h-3 w-3 bg-gray-300 rounded-full"></div>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-xs mt-1 ${isLoading
                    ? "text-gray-400"
                    : index <= currentStep
                      ? "text-blue-500"
                      : "text-gray-500"
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