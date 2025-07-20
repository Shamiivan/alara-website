import React from 'react';
import { cn } from '@/lib/utils';

interface OnboardingMascotProps {
  emotion?: 'happy' | 'excited' | 'encouraging' | 'celebrating';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const OnboardingMascot: React.FC<OnboardingMascotProps> = ({
  emotion = 'happy',
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const emotionStyles = {
    happy: 'animate-mascot-wave',
    excited: 'animate-bounce-in',
    encouraging: 'animate-pulse',
    celebrating: 'animate-bounce-in animate-mascot-wave'
  };

  return (
    <div className={cn(
      'flex items-center justify-center',
      sizeClasses[size],
      emotionStyles[emotion],
      className
    )}>
      <div className="relative">
        {/* Main mascot circle */}
        <div className="w-full h-full bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
          <span className="text-white text-2xl font-bold">A</span>
        </div>
        
        {/* Sparkle effects for celebration */}
        {emotion === 'celebrating' && (
          <>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-secondary rounded-full animate-ping delay-100"></div>
          </>
        )}
      </div>
    </div>
  );
};