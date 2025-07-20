import React from 'react';
import { OnboardingMascot } from '../OnboardingMascot';
import { OnboardingCard } from '../OnboardingCard';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ChallengeStepProps {
  value?: string;
  onChange: (value: string) => void;
}

export const ChallengeStep: React.FC<ChallengeStepProps> = ({ value = '', onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isGoodLength = wordCount >= 3 && wordCount <= 50;

  return (
    <OnboardingCard>
      <div className="text-center mb-8">
        <OnboardingMascot emotion="encouraging" size="lg" className="mb-6" />
        <h2 className="text-3xl font-bold text-foreground mb-4">
          What's your biggest challenge right now?
        </h2>
        <p className="text-lg text-muted-foreground">
          Help us understand how to support you best. Be as specific as you'd like!
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="challenge" className="text-base font-medium">
            Your biggest challenge
          </Label>
          <Textarea
            id="challenge"
            placeholder="e.g., I get overwhelmed by my to-do list and don't know where to start..."
            value={value}
            onChange={handleChange}
            className="min-h-[120px] text-base resize-none"
            maxLength={300}
          />
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {wordCount > 0 && (
                <span className={isGoodLength ? 'text-success' : ''}>
                  {wordCount} words
                </span>
              )}
            </span>
            <span>{value.length}/300 characters</span>
          </div>
        </div>

        {isGoodLength && (
          <div className="text-center">
            <p className="text-sm text-success font-medium">
              Thank you for sharing! This helps us personalize your experience ✨
            </p>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">💡 Examples to spark ideas:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• "I procrastinate on important tasks"</li>
            <li>• "I feel scattered and unfocused"</li>
            <li>• "I struggle with work-life balance"</li>
            <li>• "I have trouble sticking to routines"</li>
          </ul>
        </div>
      </div>
    </OnboardingCard>
  );
};