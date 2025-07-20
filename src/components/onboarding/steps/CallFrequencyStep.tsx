import React from 'react';
import { OnboardingMascot } from '../OnboardingMascot';
import { OnboardingCard } from '../OnboardingCard';
import { OptionButton } from '../OptionButton';
import { FREQUENCY_OPTIONS } from '@/types/onboarding';

interface CallFrequencyStepProps {
  value?: string;
  onChange: (value: string) => void;
}

export const CallFrequencyStep: React.FC<CallFrequencyStepProps> = ({ value, onChange }) => {
  return (
    <OnboardingCard>
      <div className="text-center mb-8">
        <OnboardingMascot emotion="encouraging" size="lg" className="mb-6" />
        <h2 className="text-3xl font-bold text-foreground mb-4">
          How many calls would help you most?
        </h2>
        <p className="text-lg text-muted-foreground">
          We'll work with your schedule to find the perfect rhythm.
        </p>
      </div>

      <div className="space-y-4">
        {FREQUENCY_OPTIONS.map((option) => (
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
    </OnboardingCard>
  );
};