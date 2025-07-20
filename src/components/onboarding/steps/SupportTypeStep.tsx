import React from 'react';
import { OnboardingMascot } from '../OnboardingMascot';
import { OnboardingCard } from '../OnboardingCard';
import { OptionButton } from '../OptionButton';
import { SUPPORT_OPTIONS } from '@/types/onboarding';

interface SupportTypeStepProps {
  value?: string[];
  onChange: (value: string[]) => void;
}

export const SupportTypeStep: React.FC<SupportTypeStepProps> = ({ value = [], onChange }) => {
  const handleOptionClick = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <OnboardingCard>
      <div className="text-center mb-8">
        <OnboardingMascot emotion="excited" size="lg" className="mb-6" />
        <h2 className="text-3xl font-bold text-foreground mb-4">
          How do you want Alara to support you?
        </h2>
        <p className="text-lg text-muted-foreground">
          Choose all that apply - we'll personalize your experience!
        </p>
      </div>

      <div className="space-y-4">
        {SUPPORT_OPTIONS.map((option) => (
          <OptionButton
            key={option.value}
            selected={value.includes(option.value)}
            onClick={() => handleOptionClick(option.value)}
            icon={option.icon}
          >
            {option.label}
          </OptionButton>
        ))}
      </div>

      {value.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-success font-medium">
            Great choices! {value.length} {value.length === 1 ? 'area' : 'areas'} selected ✨
          </p>
        </div>
      )}
    </OnboardingCard>
  );
};