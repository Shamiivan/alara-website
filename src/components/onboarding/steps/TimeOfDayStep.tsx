import React from 'react';
import { OnboardingMascot } from '../OnboardingMascot';
import { OnboardingCard } from '../OnboardingCard';
import { OptionButton } from '../OptionButton';
import { TIME_OPTIONS } from '@/types/onboarding';

interface TimeOfDayStepProps {
  value?: string[];
  onChange: (value: string[]) => void;
}

export const TimeOfDayStep: React.FC<TimeOfDayStepProps> = ({ value = [], onChange }) => {
  const handleOptionClick = (optionValue: string) => {
    if (optionValue === 'both') {
      onChange(['morning', 'midday']);
    } else {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value.filter(v => v !== 'morning' && v !== 'midday'), optionValue];
      onChange(newValue);
    }
  };

  const isSelected = (optionValue: string) => {
    if (optionValue === 'both') {
      return value.includes('morning') && value.includes('midday');
    }
    return value.includes(optionValue);
  };

  return (
    <OnboardingCard>
      <div className="text-center mb-8">
        <OnboardingMascot emotion="happy" size="lg" className="mb-6" />
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Morning, midday, or both?
        </h2>
        <p className="text-lg text-muted-foreground">
          When would you like your supportive check-ins?
        </p>
      </div>

      <div className="space-y-4">
        {TIME_OPTIONS.map((option) => (
          <OptionButton
            key={option.value}
            selected={isSelected(option.value)}
            onClick={() => handleOptionClick(option.value)}
            icon={option.icon}
          >
            {option.label}
          </OptionButton>
        ))}
      </div>
    </OnboardingCard>
  );
};