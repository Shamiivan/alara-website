import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default function Onboarding() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Onboarding</h1>
      <OnboardingForm />
    </div>
  );
}