import { useState, useEffect, useRef } from "react";

const Problem = () => {
  // Refs for animation elements
  const listRef = useRef<HTMLDivElement>(null);
  const batteryRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);

  // State to track which cards are visible for animations
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  // Setup intersection observer to detect when cards come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setVisibleCards((prev) => [...prev, index]);
          }
        });
      },
      { threshold: 0.3 }
    );

    // Get all cards and observe them
    const cards = document.querySelectorAll(".problem-card");
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  // Micro-animations for illustrations
  useEffect(() => {
    // List animation - grows and tips
    if (visibleCards.includes(0) && listRef.current) {
      const animation = listRef.current.animate(
        [
          { transform: "scale(0.95)", opacity: "0.7" },
          { transform: "scale(1.05)", opacity: "1" },
          { transform: "scale(1) rotate(2deg)", opacity: "1" }
        ],
        { duration: 1200, fill: "forwards", easing: "ease-out" }
      );
    }

    // Battery + sun animation
    if (visibleCards.includes(1) && batteryRef.current) {
      const animation = batteryRef.current.animate(
        [
          { opacity: "0.7", filter: "brightness(0.8)" },
          { opacity: "1", filter: "brightness(1.2)" },
          { opacity: "1", filter: "brightness(1)" }
        ],
        { duration: 1000, fill: "forwards", easing: "ease-out" }
      );
    }

    // Calendar animation - X appears
    if (visibleCards.includes(2) && calendarRef.current) {
      const animation = calendarRef.current.animate(
        [
          { transform: "scale(1)", opacity: "0.9" },
          { transform: "scale(1.1)", opacity: "1" },
          { transform: "scale(1)", opacity: "1" }
        ],
        { duration: 800, fill: "forwards", easing: "ease-out" }
      );
    }

    // Schedule shattering animation
    if (visibleCards.includes(3) && scheduleRef.current) {
      const animation = scheduleRef.current.animate(
        [
          { transform: "scale(1)", opacity: "1" },
          { transform: "scale(1.05)", opacity: "1" },
          { transform: "scale(1) rotate(-1deg)", opacity: "1", filter: "drop-shadow(0 0 2px rgba(0,0,0,0.2))" }
        ],
        { duration: 1000, fill: "forwards", easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
      );
    }
  }, [visibleCards]);

  // Problem cards data
  const problemCards = [
    {
      illustration: (
        <div ref={listRef} className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-[hsl(var(--primary))]">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 9H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 13H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 17H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 7L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 12L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 17L5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      ),
      mainLine: "Long lists when you're already overwhelmed.",
      subLine: "Yep, the list never ends."
    },
    {
      illustration: (
        <div ref={batteryRef} className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-[hsl(var(--primary))]">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 10C6 7.79086 7.79086 6 10 6H14C16.2091 6 18 7.79086 18 10V14C18 16.2091 16.2091 18 14 18H10C7.79086 18 6 16.2091 6 14V10Z" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            <path d="M14 10H10V14H14V10Z" fill="currentColor" opacity="0.7" />
            <circle cx="18" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M18 4V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 6H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      ),
      mainLine: "Plans that ignore timing, context, or energy.",
      subLine: "Energy matters, but apps don't care."
    },
    {
      illustration: (
        <div ref={calendarRef} className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-[hsl(var(--primary))]">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9 15L15 15" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 12L12 18" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="15" r="5" stroke="#EF4444" strokeWidth="1.5" opacity="0.2" />
          </svg>
        </div>
      ),
      mainLine: "Missed tasks that turn into guilt.",
      subLine: "You've felt that guilt too, right?"
    },
    {
      illustration: (
        <div ref={scheduleRef} className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-[hsl(var(--primary))]">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5 14H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5 17H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 13L20 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 19L20 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      ),
      mainLine: "Static schedules that collapse when the day changes.",
      subLine: "One change and the whole plan falls apart."
    }
  ];

  return (
    <section className="w-full py-16 sm:py-20 bg-[hsl(var(--background))] px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 fade-in">
          👉 Why traditional productivity tools break in real life
        </h2>

        {/* Problem Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {problemCards.map((card, index) => (
            <div
              key={index}
              data-index={index}
              className={`problem-card bg-card rounded-xl p-6 sm:p-8 border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)] flex flex-col items-center text-center ${visibleCards.includes(index) ? "fade-in" : "opacity-0"
                }`}
            >
              {card.illustration}
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                {card.mainLine}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground italic">
                {card.subLine}
              </p>
            </div>
          ))}
        </div>

        {/* Closing Line */}
        <p className="text-lg sm:text-xl md:text-2xl text-center font-medium text-foreground/90 fade-in">
          ✨ We've all been there — busy, but not aligned.
        </p>
      </div>
    </section>
  );
};

export default Problem;