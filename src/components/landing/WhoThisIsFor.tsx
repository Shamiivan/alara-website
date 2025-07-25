
import { CheckCircle, Heart, Lightbulb, Users, Mic, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhoThisIsFor = () => {
  return (
    <section className="py-16 sm:py-20 bg-[hsl(var(--primary-light)/0.15)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[hsl(var(--accent)/0.2)] text-[hsl(var(--accent))] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 text-xs sm:text-sm font-medium">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Join Our Community</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 tracking-tight">
            Who This Is For
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Alara is designed for overwhelmed early adopters who want to shape something meaningful while getting real support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start space-x-3 sm:space-x-4 bg-card p-4 sm:p-5 rounded-xl border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)]">
              <div className="bg-[hsl(var(--primary-light)/0.2)] p-1.5 sm:p-2 rounded-full flex-shrink-0 mt-1">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">You&apos;re Overwhelmed But Motivated</h3>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base">You have goals and dreams but struggle with daily execution. You know what you want to do but need gentle accountability to make it happen.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 bg-card p-4 sm:p-5 rounded-xl border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)]">
              <div className="bg-[hsl(var(--primary-light)/0.2)] p-1.5 sm:p-2 rounded-full flex-shrink-0 mt-1">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">You&apos;re an Early Adopter</h3>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base">You love being part of something new and meaningful. You understand that pilot products aren&apos;t perfect, but you see the potential.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start space-x-3 sm:space-x-4 bg-card p-4 sm:p-5 rounded-xl border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)]">
              <div className="bg-[hsl(var(--primary-light)/0.2)] p-1.5 sm:p-2 rounded-full flex-shrink-0 mt-1">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">You Want to Co-Create</h3>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base">You don&apos;t just want to use a product—you want to help build it. Your feedback and insights will directly shape how Alara evolves.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 bg-card p-4 sm:p-5 rounded-xl border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)]">
              <div className="bg-[hsl(var(--primary-light)/0.2)] p-1.5 sm:p-2 rounded-full flex-shrink-0 mt-1">
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">You Value Authenticity</h3>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base">You prefer real conversations over automated messages. You want support that feels human, not robotic.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card p-5 sm:p-6 md:p-8 rounded-xl border border-[hsl(var(--border))] shadow-md">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 tracking-tight">
              Your Voice Shapes Alara&apos;s Future
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base mb-4 sm:mb-6 max-w-2xl mx-auto">
              As an early adopter, you&apos;re not just getting accountability support—you&apos;re helping create the tool that will serve thousands of people like you. Your feedback, suggestions, and real-world usage will guide every feature we build.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-[hsl(var(--primary))]">
            <span className="flex items-center">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Weekly feedback sessions
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Direct line to founders
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Lifetime early adopter pricing
            </span>
          </div>

          <div className="mt-6 sm:mt-8 text-center">
            <Button
              size="lg"
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white px-4 sm:px-6 py-2 text-sm sm:text-base font-medium rounded-xl shadow-sm transition-all hover:shadow-md min-h-[44px] touch-manipulation"
            >
              Join the Program – Just $9/month
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoThisIsFor;
