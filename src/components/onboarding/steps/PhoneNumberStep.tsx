import React, { useState } from 'react';
import { OnboardingMascot } from '../OnboardingMascot';
import { OnboardingCard } from '../OnboardingCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneNumberStepProps {
  value?: string;
  onChange: (value: string) => void;
}

export const PhoneNumberStep: React.FC<PhoneNumberStepProps> = ({ value = '', onChange }) => {
  const [error, setError] = useState<string>('');

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumber;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cleaned = input.replace(/\D/g, '');
    
    if (cleaned.length <= 10) {
      const formatted = formatPhoneNumber(cleaned);
      onChange(formatted);
      
      if (cleaned.length === 10) {
        setError('');
      } else if (cleaned.length > 0) {
        setError('Please enter a complete 10-digit phone number');
      } else {
        setError('');
      }
    }
  };

  const isValid = value.replace(/\D/g, '').length === 10;

  return (
    <OnboardingCard>
      <div className="text-center mb-8">
        <OnboardingMascot emotion="encouraging" size="lg" className="mb-6" />
        <h2 className="text-3xl font-bold text-foreground mb-4">
          What's the best number to reach you?
        </h2>
        <p className="text-lg text-muted-foreground">
          We'll call you here for your personalized check-ins.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-medium">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (   ) ___-____"
            value={value}
            onChange={handleChange}
            className={`text-center text-lg py-6 ${
              isValid ? 'border-success shadow-soft' : error ? 'border-destructive' : ''
            }`}
          />
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          {isValid && (
            <p className="text-sm text-success text-center font-medium">
              Perfect! We'll reach you at this number ✓
            </p>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't worry - we'll only call during your preferred times, and you can always update this later.
          </p>
        </div>
      </div>
    </OnboardingCard>
  );
};