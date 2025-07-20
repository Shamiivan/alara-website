import React from 'react';
import { OnboardingMascot } from '../OnboardingMascot';
import { OnboardingCard } from '../OnboardingCard';
import { OptionButton } from '../OptionButton';
import { FEEDBACK_OPTIONS } from '@/types/onboarding';

interface FeedbackStepProps {
  value?: string;
  onChange: (value: string) => void;
}

export const FeedbackStep: React.FC<FeedbackStepProps> = ({ value, onChange }) => {
  return (
    <OnboardingCard>
      <div className="text-center mb-8">
        <OnboardingMascot emotion="excited" size="lg" className="mb-6" />
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Want to help shape Alara?
        </h2>
        <p className="text-lg text-muted-foreground">
          Your feedback helps us build the most helpful experience for everyone!
        </p>
      </div>

      <div className="space-y-4">
        {FEEDBACK_OPTIONS.map((option) => (
          <OptionButton
            key={option.value}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
            icon={option.icon}
          >
            {option.label}
          </OptionButton>
        ))}
      </div>

      <div className="mt-8 bg-gradient-subtle rounded-lg p-6 text-center">
        <h4 className="font-semibold text-foreground mb-2">
          🌟 Join our community of early supporters!
        </h4>
        <p className="text-sm text-muted-foreground">
          Get exclusive updates, share ideas, and connect with others on their journey to better habits and focus.
        </p>
      </div>
    </OnboardingCard>
  );
};