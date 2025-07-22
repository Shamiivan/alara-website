
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
    <section className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--primary-light)/0.15)] px-4 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Voice-first indicator */}
        <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary-light)/0.5)] text-[hsl(var(--primary))] px-4 py-2 rounded-full mb-8 text-sm font-medium">
          <Mic className="w-4 h-4" />
          <span>Voice-First Productivity</span>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            Meet Alara: Your AI Friend that{" "}
            <span className="text-[hsl(var(--primary))] block mt-2">
              <TypingAnimation phrases={typingPhrases} />
            </span>
          </h1>

          {/* Conversation visualization */}
          <div className="flex flex-col gap-4 max-w-xl mx-auto mb-8">
            <div className="bubble-ai">
              <p className="text-lg">What's your most important goal for today?</p>
            </div>

            <div className="bubble-user">
              <p className="text-lg">I need to finish the presentation for tomorrow's meeting.</p>
            </div>

            <div className="bubble-ai">
              <p className="text-lg">Let's break that down into manageable steps. When will you start?</p>
            </div>

            {/* Voice wave visualization */}
            <div className="flex items-center justify-center gap-1 h-8 mt-2">
              {isAnimating && (
                <>
                  <div className={`h-2 w-1 bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite]' : ''}`}></div>
                  <div className={`h-4 w-1 bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite_0.1s]' : ''}`}></div>
                  <div className={`h-6 w-1 bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite_0.2s]' : ''}`}></div>
                  <div className={`h-8 w-1 bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite_0.3s]' : ''}`}></div>
                  <div className={`h-6 w-1 bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite_0.4s]' : ''}`}></div>
                  <div className={`h-4 w-1 bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite_0.5s]' : ''}`}></div>
                  <div className={`h-2 w-1 bg-[hsl(var(--voice-accent))] rounded-full ${isAnimating ? 'animate-[bounce_1s_ease-in-out_infinite_0.6s]' : ''}`}></div>
                </>
              )}
            </div>
          </div>

          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Get personalized morning and mid-day calls that help you capture what matters most.
            Built with real people who know the struggle of staying on track.
          </p>
        </div>

        <div className="mb-16">
          <Button
            size="lg"
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] duration-300"
          >
            Join the Program – Just $9/month
          </Button>
          <p className="text-sm text-muted-foreground mt-3">Built with pilot users like you.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-center">
          <div className="bg-card p-6 rounded-xl shadow-sm border border-[hsl(var(--border))] transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.3)]">
            <div className="bg-[hsl(var(--primary-light)/0.2)] p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Morning Clarity</h3>
            <p className="text-muted-foreground text-sm">Start your day with intention through guided voice conversations</p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border border-[hsl(var(--border))] transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.3)]">
            <div className="bg-[hsl(var(--primary-light)/0.2)] p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Mid-Day Reset</h3>
            <p className="text-muted-foreground text-sm">Stay on course with gentle check-ins that keep you focused</p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border border-[hsl(var(--border))] transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.3)] sm:col-span-2 md:col-span-1 sm:max-w-sm sm:mx-auto md:max-w-none md:mx-0">
            <div className="bg-[hsl(var(--primary-light)/0.2)] p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Co-Creation</h3>
            <p className="text-muted-foreground text-sm">Shape the product with us as we build something that truly works</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;