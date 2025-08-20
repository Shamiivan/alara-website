import { Button } from "@/components/ui/button";
import AudioPlayer from "./AudioPlayer";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();


  const handleFindFirstStep = () => {
    router.push("dashboard");
  };
  return (
    <section className="w-full overflow-hidden flex flex-col items-center justify-center bg-[hsl(var(--background))] px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Main content with increased spacing */}
        <div className="mb-12 sm:mb-16 fade-in">
          {/* Headline - simplified and focused on overwhelm */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 sm:mb-8 leading-[1.2] sm:leading-[1.1]">
            ✨ Overwhelmed by Productivity Apps?
          </h1>
          {/* Subheadline - focused on finding clarity */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
            Most productivity apps make you busier.
            We’re building a voice-first companion that turns what’s on your mind into one clear step, with gentle check-ins and easy adjustments.
          </p>
        </div>

        {/* CTA Button - updated text and styling */}
        <div className="mb-8 sm:mb-10 fade-in flex justify-center">
          <Button
            onClick={handleFindFirstStep}
            size="lg"
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-medium rounded-xl shadow-sm transition-all hover:shadow-md hover:scale-[1.01] duration-300"
          >
            Lets find your first step →
          </Button>
        </div>

        {/* Audio player with flex centering */}
        <div className="flex justify-center mb-8 sm:mb-10 fade-in">
          <AudioPlayer />
        </div>

        <div className="w-full max-w-xl mx-auto py-5 opacity-90 fade-in">
          <div className="relative flex flex-col items-center">
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--primary-light)/0.1)] to-transparent rounded-3xl"></div>
            <div className="relative z-10 p-8 text-center">
              <p className="text-lg sm:text-xl italic text-foreground/80 mb-6">
                &ldquo;It&apos;s like having a calm friend who helps you see through the noise and find your next step.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;