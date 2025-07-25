
import { CheckCircle, Phone, Clock, Users, Mic, MessageCircle } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--primary))]" />,
      title: "Morning Voice Call",
      description: "Start each day with a personalized 5-minute call that helps you identify your top 3 priorities and set clear intentions.",
      benefits: ["Clarity on what matters most", "Reduced morning overwhelm", "Consistent daily structure"]
    },
    {
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--primary))]" />,
      title: "Mid-Day Check-In",
      description: "A gentle afternoon touchpoint to assess progress, adjust course, and maintain momentum without judgment.",
      benefits: ["Stay on track throughout the day", "Flexible adjustments when needed", "Celebrate small wins"]
    },
    {
      icon: <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--primary))]" />,
      title: "Co-Creation Emphasis",
      description: "You're not just a user—you're a partner. Your feedback directly shapes how this tool evolves to serve you better.",
      benefits: ["Direct input on features", "Weekly feedback sessions", "Early access to new capabilities"]
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary-light)/0.3)] text-[hsl(var(--primary))] px-4 py-2 rounded-full mb-6 text-sm font-medium">
            <Mic className="w-4 h-4" />
            <span>Voice-Powered Workflow</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Simple, human-centered accountability that fits into your life—not the other way around.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-background rounded-xl p-5 sm:p-6 md:p-8 border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)]">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="bg-[hsl(var(--primary-light)/0.2)] p-3 sm:p-4 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                  {feature.icon}
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 text-center">
                {feature.title}
              </h3>

              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed text-center">
                {feature.description}
              </p>

              <ul className="space-y-2 sm:space-y-3">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-start">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--success))] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground/80">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
