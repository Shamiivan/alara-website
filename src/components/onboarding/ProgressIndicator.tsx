import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  className
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-4 overflow-hidden">
        <div 
          className="h-full bg-gradient-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step dots */}
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div
              key={stepNumber}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                isCompleted && 'bg-success text-success-foreground',
                isCurrent && 'bg-primary text-primary-foreground shadow-glow animate-bounce-in',
                !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
              )}
            >
              {isCompleted ? '✓' : stepNumber}
            </div>
          );
        })}
      </div>
      
      {/* Step indicator text */}
      <div className="text-center mt-3">
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        {currentStep > totalSteps / 2 && (
          <span className="block text-xs text-primary font-medium mt-1">
            You're doing great! 🎉
          </span>
        )}
      </div>
    </div>
  );
};