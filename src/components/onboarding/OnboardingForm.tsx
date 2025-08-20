"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PhoneStep from "./steps/PhoneStep";
import CallTimeStep from "./steps/CallTimeStep";
import RemindersStep from "./steps/RemindersStep";
import SummaryStep from "./steps/SummaryStep";
import ClarityCalls from "./steps/ClarityCallsStep";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEventLogger } from "@/lib/eventLogger";
import { OnboardingErrorBoundary } from "@/components/ErrorBoundary";


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
  const { info, error, logUserAction } = useEventLogger();

  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.PHONE);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    wantsClarityCalls: false,
    callTime: "",
    wantsCallReminders: false,
  });

  // Load user data and determine current step on mount
  // Helper function to log info in development mode
  const logDevInfo = useCallback((message: string, data?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === "development") {
      info("onboarding", message, data);
    }
  }, [info]);

  useEffect(() => {
    // Check if the query has completed (even if it returned undefined)
    if (user !== undefined) {
      if (user) {
        logDevInfo("Onboarding form loaded with existing user data");

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

          if (typeof updatedFormData.wantsClarityCalls === "boolean") {
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
        logDevInfo("Resuming onboarding at step", {
          step: Object.keys(OnboardingStep)[step],
          hasExistingData: true
        });
      } else {
        // User query returned null/undefined, but it's done loading
        logDevInfo("Starting new onboarding flow");
      }

      // Always set loading to false once the query completes
      setIsLoading(false);
    }
  }, [user, logDevInfo]);

  // Handle moving to the next step - useCallback to prevent unnecessary re-renders
  const handleNext = useCallback((step: OnboardingStep, data: Partial<typeof formData>) => {
    // Log the step progression (development only)
    if (process.env.NODE_ENV === "development") {
      logUserAction(`Onboarding step completed: ${Object.keys(OnboardingStep)[currentStep]}`, "onboarding", {
        fromStep: Object.keys(OnboardingStep)[currentStep],
        toStep: Object.keys(OnboardingStep)[step],
        data
      });
    }

    // Update the form data
    setFormData((prev) => ({ ...prev, ...data }));

    // Move to the next step
    setCurrentStep(step);
  }, [currentStep, logUserAction]);

  // Handle moving to the previous step - useCallback to prevent unnecessary re-renders
  const handleBack = useCallback((step: OnboardingStep) => {
    // Log the step progression (development only)
    if (process.env.NODE_ENV === "development") {
      logUserAction(`Onboarding step back: ${Object.keys(OnboardingStep)[currentStep]}`, "onboarding", {
        fromStep: Object.keys(OnboardingStep)[currentStep],
        toStep: Object.keys(OnboardingStep)[step],
      });
    }

    setCurrentStep(step);
  }, [currentStep, logUserAction]);

  // Handle completing the onboarding process - useCallback to prevent unnecessary re-renders
  const handleComplete = useCallback(async () => {
    try {
      if (process.env.NODE_ENV === "development") {
        info("onboarding", "Completing onboarding process", formData);
      }

      // Save all data to the database
      await completeOnboarding({
        name: formData.name,
        phoneNumber: formData.phone,
        wantsClarityCalls: formData.wantsClarityCalls,
        callTime: formData.callTime,
        wantsCallReminders: formData.wantsCallReminders,
      });

      if (process.env.NODE_ENV === "development") {
        info("onboarding", "Onboarding completed successfully");
        logUserAction("Onboarding completed", "onboarding", formData);
      }

      // Show completion step briefly
      setCurrentStep(OnboardingStep.COMPLETED);

      // Redirect to payment page after a short delay
      setTimeout(() => {
        if (process.env.NODE_ENV === "development") {
          info("onboarding", "Redirecting to payment page");
        }
        router.push("/payment");
      }, 1500);

    } catch (onboardingError) {
      error("onboarding", "Failed to complete onboarding", {
        error: onboardingError instanceof Error ? onboardingError.message : String(onboardingError),
        formData
      }, true, "Failed to complete onboarding. Please try again.");

      // Only log to console in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error completing onboarding:", onboardingError);
      }
    }
  }, [completeOnboarding, formData, info, logUserAction, error, router]);

  // Create stable callback functions for navigation
  const handlePhoneNext = useCallback((data: { name: string; phone: string }) => {
    handleNext(OnboardingStep.WANTS_CLARITY_CALLS, { name: data.name, phone: data.phone });
  }, [handleNext]);

  const handleClarityNext = useCallback((wantsClarityCalls: boolean) => {
    handleNext(OnboardingStep.CALL_TIME, { wantsClarityCalls });
  }, [handleNext]);

  const handleClarityBack = useCallback(() => {
    handleBack(OnboardingStep.PHONE);
  }, [handleBack]);

  const handleCallTimeNext = useCallback((callTime: string) => {
    handleNext(OnboardingStep.REMINDERS, { callTime });
  }, [handleNext]);

  const handleCallTimeBack = useCallback(() => {
    handleBack(OnboardingStep.WANTS_CLARITY_CALLS);
  }, [handleBack]);

  const handleRemindersNext = useCallback((wantsCallReminders: boolean) => {
    handleNext(OnboardingStep.SUMMARY, { wantsCallReminders });
  }, [handleNext]);

  const handleRemindersBack = useCallback(() => {
    handleBack(OnboardingStep.CALL_TIME);
  }, [handleBack]);

  const handleSummaryBack = useCallback(() => {
    handleBack(OnboardingStep.REMINDERS);
  }, [handleBack]);

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

    // Debug current step
    if (process.env.NODE_ENV === "development") {
      console.log("Current onboarding step:", Object.keys(OnboardingStep)[currentStep]);
    }
    switch (currentStep) {
      case OnboardingStep.PHONE:
        return (
          <PhoneStep
            key="phone-step"
            initialValues={{ name: formData.name, phone: formData.phone }}
            onNext={handlePhoneNext}
          />
        );

      case OnboardingStep.WANTS_CLARITY_CALLS:
        return (
          <ClarityCalls
            key="clarity-calls-step"
            initialValue={formData.wantsClarityCalls}
            onNext={handleClarityNext}
            onBack={handleClarityBack}
          />
        );
      case OnboardingStep.CALL_TIME:
        return (
          <CallTimeStep
            key="call-time-step"
            initialValue={formData.callTime}
            onNext={handleCallTimeNext}
            onBack={handleCallTimeBack}
          />
        );
      case OnboardingStep.REMINDERS:
        return (
          <RemindersStep
            key="reminders-step"
            initialValue={formData.wantsCallReminders}
            onNext={handleRemindersNext}
            onBack={handleRemindersBack}
          />
        );
      case OnboardingStep.SUMMARY:
        return (
          <SummaryStep
            key="summary-step"
            data={formData}
            onBack={handleSummaryBack}
            onComplete={handleComplete}
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
    <OnboardingErrorBoundary>
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
    </OnboardingErrorBoundary>
  );
}