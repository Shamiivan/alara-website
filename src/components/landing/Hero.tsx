
import { Button } from "@/components/ui/button";
import TypingAnimation from "./TypingAnimation";
import { Mic, Phone, Clock, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

const Hero = () => {
  const typingPhrases = [
    "help you stay organized",
    "help you follow through",
    "keep you accountable",
    "turn overwhelm into clarity",
    "simplify your productivity"
  ];

  // Animation for voice wave visualization
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation after a delay
    const timer = setTimeout(() => {
      setIsAnimating(true);

      // Stop animation after 3 seconds
      const stopTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 3000);

      return () => clearTimeout(stopTimer);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full overflow-hidden flex flex-col items-center justify-center bg-[hsl(var(--primary-light)/0.15)] px-4 py-12 sm:py-20">
      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Voice-first indicator */}
        <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary-light)/0.5)] text-[hsl(var(--primary))] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 text-xs sm:text-sm font-medium">
          <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Voice-First Productivity</span>
        </div>

        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4 sm:mb-6 leading-[1.2] sm:leading-[1.1] px-1">
            <span className="block mb-1 sm:mb-2">Meet Alara: Your AI Friend</span>
            <span className="text-[hsl(var(--primary))] block">
              <TypingAnimation phrases={typingPhrases} />
            </span>
          </h1>

          {/* Conversation visualization - more compact on mobile */}
          <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-md sm:max-w-xl mx-auto mb-6 sm:mb-8 px-2">
            <div className="bubble-ai max-w-[85%] sm:max-w-[75%]">
              <p className="text-base sm:text-lg">What's your most important goal for today?</p>
            </div>

            <div className="bubble-user max-w-[85%] sm:max-w-[75%]">
              <p className="text-base sm:text-lg">I need to finish the presentation for tomorrow's meeting.</p>
            </div>

            <div className="bubble-ai max-w-[85%] sm:max-w-[75%]">
              <p className="text-base sm:text-lg">Let's break that down into manageable steps. When will you start?</p>
            </div>

            {/* Voice wave visualization */}
            <div className="flex items-center justify-center gap-[2px] sm:gap-1 h-6 sm:h-8 mt-2">
              {isAnimating && (
                <>
                  <div className={`h-1.5 sm:h-2 w-[3px] bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite]' : ''}`}></div>
                  <div className={`h-3 sm:h-4 w-[3px] bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite_0.1s]' : ''}`}></div>
                  <div className={`h-4 sm:h-6 w-[3px] bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite_0.2s]' : ''}`}></div>
                  <div className={`h-5 sm:h-8 w-[3px] bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite_0.3s]' : ''}`}></div>
                  <div className={`h-4 sm:h-6 w-[3px] bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite_0.4s]' : ''}`}></div>
                  <div className={`h-3 sm:h-4 w-[3px] bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite_0.5s]' : ''}`}></div>
                  <div className={`h-1.5 sm:h-2 w-[3px] bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite_0.6s]' : ''}`}></div>
                </>
              )}
            </div>
          </div>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-xs sm:max-w-lg md:max-w-3xl mx-auto leading-relaxed px-1">
            Get personalized morning and mid-day calls that help you capture what matters most.
            Built with real people who know the struggle of staying on track.
          </p>
        </div>

        <div className="mb-10 sm:mb-16">
          <Button
            size="lg"
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] duration-300 min-h-[48px] touch-manipulation"
          >
            Join the Program – Just $9/month
          </Button>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3">Built with pilot users like you.</p>
        </div>

        {/* Responsive grid with better spacing on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-center">
          <div className="bg-card p-4 sm:p-6 rounded-xl shadow-sm border border-[hsl(var(--border))] transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.3)]">
            <div className="bg-[hsl(var(--primary-light)/0.2)] p-2 sm:p-3 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="font-semibold text-foreground mb-1 sm:mb-2">Morning Clarity</h3>
            <p className="text-muted-foreground text-xs sm:text-sm">Start your day with intention through guided voice conversations</p>
          </div>

          <div className="bg-card p-4 sm:p-6 rounded-xl shadow-sm border border-[hsl(var(--border))] transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.3)]">
            <div className="bg-[hsl(var(--primary-light)/0.2)] p-2 sm:p-3 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="font-semibold text-foreground mb-1 sm:mb-2">Mid-Day Reset</h3>
            <p className="text-muted-foreground text-xs sm:text-sm">Stay on course with gentle check-ins that keep you focused</p>
          </div>

          <div className="bg-card p-4 sm:p-6 rounded-xl shadow-sm border border-[hsl(var(--border))] transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.3)] sm:col-span-2 md:col-span-1 sm:max-w-sm sm:mx-auto md:max-w-none md:mx-0">
            <div className="bg-[hsl(var(--primary-light)/0.2)] p-2 sm:p-3 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="font-semibold text-foreground mb-1 sm:mb-2">Co-Creation</h3>
            <p className="text-muted-foreground text-xs sm:text-sm">Shape the product with us as we build something that truly works</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;