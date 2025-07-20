import React from 'react';
import { OnboardingMascot } from '../OnboardingMascot';
import { OnboardingCard } from '../OnboardingCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OnboardingData } from '@/types/onboarding';

interface SummaryStepProps {
  data: OnboardingData;
  onStartSubscription: () => void;
}

export const SummaryStep: React.FC<SummaryStepProps> = ({ data, onStartSubscription }) => {
  const getSupportTypeText = () => {
    if (!data.supportType || data.supportType.length === 0) return 'Not specified';
    return data.supportType.map(type => {
      const typeMap: Record<string, string> = {
        focus: 'Stay focused',
        overwhelm: 'Ease overwhelm',
        emotions: 'Understand emotions',
        distraction: 'Avoid distractions'
      };
      return typeMap[type] || type;
    }).join(', ');
  };

  const getTimeText = () => {
    if (!data.timeOfDay || data.timeOfDay.length === 0) return 'Not specified';
    if (data.timeOfDay.includes('morning') && data.timeOfDay.includes('midday')) {
      return 'Morning and midday check-ins';
    }
    return data.timeOfDay.includes('morning') ? 'Morning check-ins' : 'Midday check-ins';
  };

  return (
    <OnboardingCard>
      <div className="text-center mb-8">
        <OnboardingMascot emotion="celebrating" size="lg" className="mb-6" />
        <h2 className="text-3xl font-bold text-foreground mb-4">
          You're all set! 🎉
        </h2>
        <p className="text-lg text-muted-foreground">
          Here's your personalized Alara experience:
        </p>
      </div>

      <Card className="p-6 mb-8 bg-gradient-subtle border-primary/20">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">🎯</span>
            <div>
              <h4 className="font-semibold text-foreground">Your focus:</h4>
              <p className="text-muted-foreground">{getSupportTypeText()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-lg">📅</span>
            <div>
              <h4 className="font-semibold text-foreground">Call schedule:</h4>
              <p className="text-muted-foreground">
                {data.callFrequency === 'daily' ? 'Daily' : 
                 data.callFrequency === 'weekdays' ? 'Weekdays only' :
                 data.callFrequency === 'midday' ? 'Mid-day only' : 'Custom schedule'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-lg">⏰</span>
            <div>
              <h4 className="font-semibold text-foreground">Timing:</h4>
              <p className="text-muted-foreground">{getTimeText()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-lg">📞</span>
            <div>
              <h4 className="font-semibold text-foreground">Contact:</h4>
              <p className="text-muted-foreground">{data.phoneNumber || 'Not provided'}</p>
            </div>
          </div>

          {data.biggestChallenge && (
            <div className="flex items-start gap-3">
              <span className="text-lg">💪</span>
              <div>
                <h4 className="font-semibold text-foreground">Your challenge:</h4>
                <p className="text-muted-foreground">"{data.biggestChallenge}"</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="text-center space-y-6">
        <div className="bg-primary/10 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Ready to start your journey?
          </h3>
          <p className="text-lg text-primary font-semibold mb-4">
            Just $9/month
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Cancel anytime. Your first call will be scheduled within 24 hours.
          </p>
          
          <Button
            size="lg"
            onClick={onStartSubscription}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
          >
            Start My Alara Journey ✨
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </OnboardingCard>
  );
};