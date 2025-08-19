import { Phone, Clock, CheckCircle } from "lucide-react";

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
                A short conversation to unload what's on your mind.
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
                A quick call to see how it's going. Are you on track? Did something change? Should we adjust?
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
        <p className="text-lg sm:text-xl md:text-2xl text-center font-medium text-foreground/90 max-w-3xl mx-auto">
          The calls are what make it different. The rest works like a to-do app.
        </p>
      </div>
    </section>
  );
};

export default HowItWorks;