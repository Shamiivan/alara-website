import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoBack: boolean;
  onNext: () => void;
  onBack: () => void;
  nextLabel?: string;
  backLabel?: string;
  className?: string;
}

export const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  currentStep,
  totalSteps,
  canGoNext,
  canGoBack,
  onNext,
  onBack,
  nextLabel = "Continue",
  backLabel = "Back",
  className
}) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className={cn(
      'flex justify-between items-center w-full max-w-2xl mx-auto mt-8',
      className
    )}>
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={!canGoBack}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        {backLabel}
      </Button>

      <div className="flex-1" />

      <Button
        onClick={onNext}
        disabled={!canGoNext}
        size="lg"
        className={cn(
          'flex items-center gap-2 px-6',
          canGoNext && !isLastStep && 'bg-gradient-primary hover:shadow-glow',
          canGoNext && isLastStep && 'bg-gradient-warm hover:shadow-glow'
        )}
      >
        {nextLabel}
        {!isLastStep && <ChevronRight className="w-4 h-4" />}
      </Button>
    </div>
  );
};