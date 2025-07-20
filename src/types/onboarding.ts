export interface OnboardingData {
  purpose?: string;
  supportType?: string[];
  callFrequency?: string;
  timeOfDay?: string[];
  morningTime?: string;
  middayTime?: string;
  phoneNumber?: string;
  biggestChallenge?: string;
  feedbackParticipation?: string;
  currentStep: number;
  completed: boolean;
}

export const ONBOARDING_STEPS = {
  PURPOSE: 1,
  SUPPORT_TYPE: 2,
  CALL_FREQUENCY: 3,
  TIME_OF_DAY: 4,
  PHONE_NUMBER: 5,
  CHALLENGE: 6,
  FEEDBACK: 7,
  SUMMARY: 8,
} as const;

export const PURPOSE_OPTIONS = [
  { value: "planning", label: "I'd love help with planning my day.", icon: "📅" },
  { value: "reminders", label: "Reminders keep me on track.", icon: "⏰" },
  { value: "habits", label: "Habit-tracking made easy.", icon: "✅" },
];

export const SUPPORT_OPTIONS = [
  { value: "focus", label: "Help me stay focused.", icon: "🎯" },
  { value: "overwhelm", label: "Ease the overwhelm.", icon: "😌" },
  { value: "emotions", label: "Help me understand my emotions better.", icon: "🧠" },
  { value: "distraction", label: "Stop me from getting distracted.", icon: "🚫" },
];

export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Every day.", icon: "📆" },
  { value: "weekdays", label: "Only weekdays.", icon: "📋" },
  { value: "midday", label: "Just mid-day check-ins.", icon: "🕐" },
  { value: "custom", label: "Something custom.", icon: "⚙️" },
];

export const TIME_OPTIONS = [
  { value: "morning", label: "Morning clarity pep talk.", icon: "🌅" },
  { value: "midday", label: "Gentle midday reset.", icon: "☀️" },
  { value: "both", label: "Yes to both!", icon: "⭐" },
];

export const FEEDBACK_OPTIONS = [
  { value: "weekly", label: "Yes—let's give weekly feedback!", icon: "💬" },
  { value: "discord", label: "I'd like to join Discord.", icon: "💭" },
  { value: "later", label: "Maybe later.", icon: "⏰" },
];