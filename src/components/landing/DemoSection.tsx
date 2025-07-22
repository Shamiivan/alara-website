
import { Play, Mic, Volume2, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

const DemoSection = () => {
  return (
    <section className="py-16 sm:py-20 bg-[hsl(var(--background))]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] px-4 py-2 rounded-full mb-6 text-sm font-medium">
            <Headphones className="w-4 h-4" />
            <span>Voice-First Experience</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Listen to How It Feels
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience a real morning call and discover how gentle voice accountability can transform your daily routine.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="bg-[hsl(var(--primary-dark))] rounded-xl overflow-hidden shadow-xl aspect-video border border-[hsl(var(--border))]">
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[hsl(var(--primary-dark))] to-[hsl(var(--primary))]">
              <div className="text-center p-6">
                <div className="relative mb-6 group">
                  <div className="absolute -inset-4 bg-[hsl(var(--primary-light)/0.3)] rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Button
                    size="lg"
                    className="relative bg-white text-[hsl(var(--primary))] hover:bg-[hsl(var(--background))] rounded-full p-6 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Play className="w-8 h-8" />
                  </Button>
                </div>
                <p className="text-white text-lg sm:text-xl font-medium">
                  Experience a Sample Morning Call
                </p>
                <p className="text-[hsl(var(--background))] text-sm mt-2">
                  3 minutes • Real conversation, real results
                </p>

                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-2 bg-[hsl(var(--background)/0.2)] text-white px-4 py-2 rounded-full text-sm">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span>Best experienced with headphones</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 sm:-bottom-5 -right-4 sm:-right-5 bg-[hsl(var(--accent))] text-white px-4 py-2 rounded-lg shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300">
            <p className="text-sm font-medium">Coming Soon: Live Demo</p>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
            <div className="text-center bg-card p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm">
              <div className="inline-flex items-center justify-center bg-[hsl(var(--primary)/0.15)] p-3 rounded-full mb-4">
                <Mic className="w-5 h-5 text-[hsl(var(--primary))]" />
              </div>
              <div className="text-2xl font-bold text-[hsl(var(--primary))] mb-2">5 min</div>
              <p className="text-muted-foreground text-sm">Average call length</p>
            </div>
            <div className="text-center bg-card p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm">
              <div className="inline-flex items-center justify-center bg-[hsl(var(--primary)/0.15)] p-3 rounded-full mb-4">
                <Volume2 className="w-5 h-5 text-[hsl(var(--primary))]" />
              </div>
              <div className="text-2xl font-bold text-[hsl(var(--primary))] mb-2">2x daily</div>
              <p className="text-muted-foreground text-sm">Morning + afternoon</p>
            </div>
            <div className="text-center bg-card p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm">
              <div className="inline-flex items-center justify-center bg-[hsl(var(--primary)/0.15)] p-3 rounded-full mb-4">
                <Headphones className="w-5 h-5 text-[hsl(var(--primary))]" />
              </div>
              <div className="text-2xl font-bold text-[hsl(var(--primary))] mb-2">0 pressure</div>
              <p className="text-muted-foreground text-sm">Just gentle guidance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
