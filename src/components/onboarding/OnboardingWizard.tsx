import React, { useState, useEffect } from 'react';
import { ProgressIndicator } from './ProgressIndicator';
import { OnboardingNavigation } from './OnboardingNavigation';
import { PurposeStep } from './steps/PurposeStep';
import { SupportTypeStep } from './steps/SupportTypeStep';
import { CallFrequencyStep } from './steps/CallFrequencyStep';
import { TimeOfDayStep } from './steps/TimeOfDayStep';
import { PhoneNumberStep } from './steps/PhoneNumberStep';
import { ChallengeStep } from './steps/ChallengeStep';
import { FeedbackStep } from './steps/FeedbackStep';
import { SummaryStep } from './steps/SummaryStep';
import { OnboardingData, ONBOARDING_STEPS } from '@/types/onboarding';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'alara-onboarding-data';

export const OnboardingWizard: React.FC = () => {
  const [data, setData] = useState<OnboardingData>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // If parsing fails, start fresh
      }
    }
    return {
      currentStep: ONBOARDING_STEPS.PURPOSE,
      completed: false
    };
  });

  const { toast } = useToast();

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const goToNext = () => {
    if (canGoNext()) {
      const nextStep = data.currentStep + 1;
      updateData({ currentStep: nextStep });

      // Show encouraging toast for certain steps
      if (nextStep === ONBOARDING_STEPS.SUMMARY) {
        toast({
          title: "Almost there! 🎉",
          description: "You've completed the setup. Let's review everything!",
        });
      }
    }
  };

  const goToBack = () => {
    if (data.currentStep > 1) {
      updateData({ currentStep: data.currentStep - 1 });
    }
  };

  const canGoNext = (): boolean => {
    switch (data.currentStep) {
      case ONBOARDING_STEPS.PURPOSE:
        return !!data.purpose;
      case ONBOARDING_STEPS.SUPPORT_TYPE:
        return !!data.supportType && data.supportType.length > 0;
      case ONBOARDING_STEPS.CALL_FREQUENCY:
        return !!data.callFrequency;
      case ONBOARDING_STEPS.TIME_OF_DAY:
        return !!data.timeOfDay && data.timeOfDay.length > 0;
      case ONBOARDING_STEPS.PHONE_NUMBER:
        const phoneValid = data.phoneNumber && data.phoneNumber.replace(/\D/g, '').length === 10;
        return !!phoneValid;
      case ONBOARDING_STEPS.CHALLENGE:
        const challengeValid = data.biggestChallenge && data.biggestChallenge.trim().length >= 10;
        return !!challengeValid;
      case ONBOARDING_STEPS.FEEDBACK:
        return !!data.feedbackParticipation;
      case ONBOARDING_STEPS.SUMMARY:
        return true;
      default:
        return false;
    }
  };

  const canGoBack = (): boolean => {
    return data.currentStep > 1;
  };

  const handleStartSubscription = () => {
    // Clear onboarding data
    localStorage.removeItem(STORAGE_KEY);

    toast({
      title: "Welcome to Alara! 🌟",
      description: "Your personalized journey begins now. We'll be in touch soon!",
    });

    // Here you would typically redirect to payment or dashboard
    console.log('Starting subscription with data:', data);
  };

  const renderCurrentStep = () => {
    switch (data.currentStep) {
      case ONBOARDING_STEPS.PURPOSE:
        return (
          <PurposeStep
            value={data.purpose}
            onChange={(purpose) => updateData({ purpose })}
          />
        );
      case ONBOARDING_STEPS.SUPPORT_TYPE:
        return (
          <SupportTypeStep
            value={data.supportType}
            onChange={(supportType) => updateData({ supportType })}
          />
        );
      case ONBOARDING_STEPS.CALL_FREQUENCY:
        return (
          <CallFrequencyStep
            value={data.callFrequency}
            onChange={(callFrequency) => updateData({ callFrequency })}
          />
        );
      case ONBOARDING_STEPS.TIME_OF_DAY:
        return (
          <TimeOfDayStep
            value={data.timeOfDay}
            onChange={(timeOfDay) => updateData({ timeOfDay })}
          />
        );
      case ONBOARDING_STEPS.PHONE_NUMBER:
        return (
          <PhoneNumberStep
            value={data.phoneNumber}
            onChange={(phoneNumber) => updateData({ phoneNumber })}
          />
        );
      case ONBOARDING_STEPS.CHALLENGE:
        return (
          <ChallengeStep
            value={data.biggestChallenge}
            onChange={(biggestChallenge) => updateData({ biggestChallenge })}
          />
        );
      case ONBOARDING_STEPS.FEEDBACK:
        return (
          <FeedbackStep
            value={data.feedbackParticipation}
            onChange={(feedbackParticipation) => updateData({ feedbackParticipation })}
          />
        );
      case ONBOARDING_STEPS.SUMMARY:
        return (
          <SummaryStep
            data={data}
            onStartSubscription={handleStartSubscription}
          />
        );
      default:
        return null;
    }
  };

  const totalSteps = Object.keys(ONBOARDING_STEPS).length;

  return (
    <div className="min-h-screen bg-onboarding-bg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress indicator */}
        <ProgressIndicator
          currentStep={data.currentStep}
          totalSteps={totalSteps}
          className="mb-8"
        />

        {/* Current step content */}
        <div className="mb-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation - hidden on summary step as it has its own CTA */}
        {data.currentStep !== ONBOARDING_STEPS.SUMMARY && (
          <OnboardingNavigation
            currentStep={data.currentStep}
            totalSteps={totalSteps}
            canGoNext={canGoNext()}
            canGoBack={canGoBack()}
            onNext={goToNext}
            onBack={goToBack}
            nextLabel={data.currentStep === totalSteps - 1 ? "Review & Finish" : "Continue"}
          />
        )}
      </div>
    </div>
  );
};