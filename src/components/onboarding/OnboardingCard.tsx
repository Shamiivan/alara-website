import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface OnboardingCardProps {
  children: React.ReactNode;
  className?: string;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  children,
  className
}) => {
  return (
    <Card className={cn(
      'w-full max-w-2xl mx-auto p-8 bg-onboarding-card shadow-card border-0',
      'animate-slide-in-right',
      className
    )}>
      {children}
    </Card>
  );
};