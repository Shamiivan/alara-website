"use client";

import { Button } from "@/components/ui/button";
import AudioPlayer from "./AudioPlayer";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();

  const handleFindFirstStep = () => {
    router.push("/dashboard");
  };

  return (
    /**
     * Full‑bleed background fix:
     * - w-screen ensures the section spans the viewport width
     * - left-1/2 / -translate-x-1/2 centers the w-screen element even inside a max-w container
     * - isolation + overflow-hidden avoid bleed side-effects on siblings
     */
    <section
      className="
        relative isolate overflow-hidden
        left-1/2 -translate-x-1/2 w-screen
        bg-[hsl(var(--background))]
        [background-image:linear-gradient(to_bottom,theme(colors.indigo.50/60%),transparent)]
        dark:[background-image:linear-gradient(to_bottom,theme(colors.indigo.950/40%),transparent)]
        px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24
      "
    >
      {/* Soft decorative blob, subtle + performant */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-0 -top-16 mx-auto h-64 w-[90%] max-w-5xl
          rounded-[48px] blur-3xl
          bg-[hsl(var(--primary)/0.08)]
          dark:bg-[hsl(var(--primary)/0.12)]
        "
      />

      {/* Content container */}
      <div className="relative mx-auto w-full max-w-3xl text-center">
        {/* Headline */}
        <div className="mb-10 sm:mb-12 fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
            Feel overwhelmed by productivity apps?
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
            We're building a voice‑first companion that turns what’s on your mind into one clear step, with gentle
            check‑ins and easy adjustments—so you stay aligned, not just busy.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="mb-8 sm:mb-10 fade-in flex justify-center gap-3">
          <Button
            onClick={handleFindFirstStep}
            size="lg"
            className="
              bg-[hsl(var(--primary))]
              hover:bg-[hsl(var(--primary)/0.9)]
              text-primary-foreground
              px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-medium
              rounded-xl shadow-sm transition-transform duration-250
              hover:shadow-md hover:scale-[1.01] focus-visible:scale-[1.01]
            "
          >
            Find your first step →
          </Button>
        </div>

        {/* Proof via audio (short, optional) */}
        <div className="flex justify-center mb-8 sm:mb-10 fade-in">
          <AudioPlayer aria-label="Hear a 20-second example of planning a clear first step" />
        </div>

        {/* Social proof / positioning */}
        <div className="w-full max-w-xl mx-auto py-5 opacity-95 fade-in">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-[hsl(var(--primary)/0.06)] dark:bg-[hsl(var(--primary)/0.09)]" />
            <blockquote className="relative z-10 p-6 sm:p-8 text-center">
              <p className="text-lg sm:text-xl text-foreground/85 italic">
                “It feels like a calm friend who cuts through the noise and helps you start.”
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
