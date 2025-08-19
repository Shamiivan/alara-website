import { Phone, Clock, CheckCircle, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 tracking-tight">
          How does it Work?
        </h2>

        {/* Call Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Planning Call Card */}
          <div className="bg-card rounded-xl p-6 sm:p-8 border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)]">
            <div className="flex flex-col items-center text-center">
              <div className="bg-[hsl(var(--primary-light)/0.2)] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-7 h-7 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
                Planning Call <span className="text-[hsl(var(--muted-foreground))]">(morning)</span>
              </h3>
              <p className="text-base text-muted-foreground mb-2">
                A short conversation to unload what&apos;s on your mind.
              </p>
              <p className="text-base text-muted-foreground">
                We turn it into one clear step with light support.
              </p>
            </div>
          </div>

          {/* Check-in Call Card */}
          <div className="bg-card rounded-xl p-6 sm:p-8 border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)]">
            <div className="flex flex-col items-center text-center">
              <div className="bg-[hsl(var(--primary-light)/0.2)] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
                Check-in Call <span className="text-[hsl(var(--muted-foreground))]">(when the tasks are scheduled)</span>
              </h3>
              <p className="text-base text-muted-foreground mb-2">
                A quick call to see how it&apos;s going. Are you on track? Did something change? Should we adjust?
              </p>
              {/* list of question remove the bullet point  */}
              {/* make the list align center */}
              <ul className="text-base text-muted-foreground list-none justify-center">
                <li>Are you on track?</li>
                <li>Did something change?</li>
                <li>Should we adjust?</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Closing Line */}
        <p className="text-lg sm:text-xl md:text-2xl text-center font-medium text-foreground/90 max-w-3xl mx-auto mb-10">
          The calls are what make it different. The rest works like a to-do app.
        </p>
      </div>

      {/* CTA Section - Full Width Background */}
      <div className="w-full bg-gradient-to-b from-[hsl(var(--primary-light)/0.3)] to-transparent py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary mb-2 animate-subtle-bounce">
              <ArrowRight className="w-6 h-6 text-primary-foreground" />
            </div>

            {/* Enhanced Join Pilot Button */}
            <div className="relative group">
              {/* Subtle glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[hsl(var(--primary)/0.6)] via-[hsl(var(--secondary)/0.7)] to-[hsl(var(--primary)/0.6)] rounded-full blur-sm opacity-60 group-hover:opacity-90 transition-all duration-500"></div>

              <Button asChild size="lg" className="relative text-base sm:text-lg font-semibold px-8 py-4 h-auto rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] hover:from-[hsl(var(--secondary))] hover:to-[hsl(var(--primary))] shadow-md hover:shadow-lg transition-all duration-300 border border-white/10">
                <Link href="/onboarding" className="flex items-center gap-2">
                  <span>Join the Pilot</span>
                  <CheckCircle className="w-5 h-5" />
                </Link>
              </Button>
            </div>

            <Button asChild variant="link" className="text-base font-medium hover:text-primary/80 transition-colors mt-3">
              <Link href="/faq" className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Read the FAQ</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;