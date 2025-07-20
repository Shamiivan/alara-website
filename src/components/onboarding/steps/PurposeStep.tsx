import React from 'react';
import { OnboardingMascot } from '../OnboardingMascot';
import { OnboardingCard } from '../OnboardingCard';
import { OptionButton } from '../OptionButton';
import { PURPOSE_OPTIONS } from '@/types/onboarding';

interface PurposeStepProps {
  value?: string;
  onChange: (value: string) => void;
}

export const PurposeStep: React.FC<PurposeStepProps> = ({ value, onChange }) => {
  return (
    <OnboardingCard>
      <div className="text-center mb-8">
        <OnboardingMascot emotion="happy" size="lg" className="mb-6" />
        <h2 className="text-3xl font-bold text-foreground mb-4">
          What brought you to Alara today?
        </h2>
        <p className="text-lg text-muted-foreground">
          Let's start by understanding what you're hoping to achieve!
        </p>
      </div>

      <div className="space-y-4">
        {PURPOSE_OPTIONS.map((option) => (
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