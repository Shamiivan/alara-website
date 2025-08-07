
import { MessageCircle, Heart, Brain, Target, Headphones } from "lucide-react";

const Vision = () => {
  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-[hsl(var(--secondary)/0.2)] text-[hsl(var(--secondary))] px-4 py-2 rounded-full mb-6 text-sm font-medium">
            <Headphones className="w-4 h-4" />
            <span>Our Philosophy</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
            Transform Overwhelm Into Progress
            <span className="text-[hsl(var(--primary))] block mt-2">Through Conversation</span>
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Real change happens when you understand yourself, not when you master another app.
            We believe in progress through reflection, clarity through conversation,
            and accountability that feels like friendship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-16">
          <div className="bg-card rounded-xl p-4 sm:p-6 border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)] text-center">
            <div className="bg-[hsl(var(--primary-light)/0.2)] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Voice-First</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Talk naturally, like you would to a trusted friend who truly listens
            </p>
          </div>

          <div className="bg-card rounded-xl p-4 sm:p-6 border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)] text-center">
            <div className="bg-[hsl(var(--primary-light)/0.2)] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Self-Awareness</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Discover patterns in your thoughts and emotions that drive real change
            </p>
          </div>

          <div className="bg-card rounded-xl p-4 sm:p-6 border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)] text-center">
            <div className="bg-[hsl(var(--primary-light)/0.2)] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Gentle Support</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Accountability without judgment, guidance without pressure
            </p>
          </div>

          <div className="bg-card rounded-xl p-4 sm:p-6 border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)] text-center">
            <div className="bg-[hsl(var(--primary-light)/0.2)] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Clear Action</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Turn inner clarity into concrete steps that actually matter
            </p>
          </div>
        </div>

        <div className="bg-[hsl(var(--voice-bg))] rounded-xl p-5 sm:p-6 md:p-8 lg:p-12 border border-[hsl(var(--primary-light)/0.3)]">
          <div className="max-w-3xl mx-auto">
            {/* Conversation example */}
            <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 px-1 sm:px-0">
              <div className="bubble-ai max-w-[85%] sm:max-w-md">
                <p>What&apos;s been your biggest challenge with productivity apps?</p>
              </div>

              <div className="bubble-user max-w-[85%] sm:max-w-md">
                <p>They&apos;re too rigid. I spend more time managing the app than doing actual work.</p>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight">
                Beyond To-Do Lists and Color-Coded Calendars
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-foreground/80 mb-4 sm:mb-6 leading-relaxed">
                We&apos;ve tried them all – the apps, the systems, the productivity hacks.
                But real progress isn&apos;t about managing tasks; it&apos;s about managing yourself.
                Your emotions, your energy, your inner dialogue.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-foreground/80 leading-relaxed">
                Alara meets you where you are, helping you understand what&apos;s working,
                what isn&apos;t, and most importantly – why. Through simple daily conversations
                that feel more like therapy than task management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;
