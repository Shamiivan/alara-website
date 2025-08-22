"use client"

import { MessageSquare, SunMoon, Bell, Sparkles, Heart, Coffee, Smile } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";

const WhatWereBuilding = () => {
  const card4Ref = useRef<HTMLDivElement>(null);
  const [activeEmoji, setActiveEmoji] = useState<string>("✨");

  // Use useMemo to prevent recreation of emojis array on each render
  const emojis = useMemo(() => ["✨", "🌈", "🦄", "🎉", "💫", "🌟", "🪄", "🧸"], []);

  // Function to cycle through emojis for the closing line
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [emojis]);

  // Function to trigger confetti animation on Card 4 hover
  useEffect(() => {
    const card4Element = card4Ref.current;

    if (!card4Element) return;

    const handleHover = () => {
      // Confetti animation
      const confettiCount = 50;
      const colors = ["#ff718d", "#fdff6a", "#5dfdcb", "#7cc9ff", "#ff99e6"];

      for (let i = 0; i < confettiCount; i++) {
        createConfettiPiece(card4Element, colors[Math.floor(Math.random() * colors.length)]);
      }

      // Also add sparkle animation
      card4Element.classList.add("sparkle-animation");
      setTimeout(() => {
        card4Element.classList.remove("sparkle-animation");
      }, 1000);
    };

    card4Element.addEventListener("mouseenter", handleHover);
    card4Element.addEventListener("touchstart", handleHover);

    return () => {
      card4Element.removeEventListener("mouseenter", handleHover);
      card4Element.removeEventListener("touchstart", handleHover);
    };
  }, []);

  // Function to create a single confetti piece
  const createConfettiPiece = (container: HTMLElement, color: string) => {
    const confetti = document.createElement("div");
    confetti.className = "confetti-piece";
    confetti.style.backgroundColor = color;
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.top = (Math.random() * 20) - 10 + "%";
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

    container.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 2000);
  };

  return (
    <section className="py-16 sm:py-20 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-12 left-8 text-4xl animate-bounce-slow opacity-30">🌱</div>
      <div className="absolute bottom-24 right-12 text-4xl animate-spin-slow opacity-30">🌀</div>
      <div className="absolute top-1/3 right-16 text-3xl animate-pulse opacity-30">💭</div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] px-4 py-2 rounded-full mb-6 text-sm font-medium transform rotate-1">
            <Coffee className="w-4 h-4" />
            <span>We&apos;re still brewing...</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight leading-tight">
            What we&apos;re building
            <span className="inline-block ml-2 animate-wiggle">🛠️</span>
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We&apos;re building a different kind of productivity tool — one that feels more like a
            <span className="text-[hsl(var(--primary))] font-medium"> cozy chat with a friend </span>
            than a cold, robotic checklist. It&apos;s still early, a little bit messy, and very much a work in progress.
            Right now, we&apos;re looking for pilot users: people who&apos;ve felt this pain firsthand and
            believe this might help them.
          </p>
        </div>

        {/* Vision Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-card rounded-xl p-4 sm:p-6 border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)] text-center transform transition-transform hover:translate-y-[-5px] duration-300 rotate-[0.5deg]"
            data-aos="fade-up">
            <div className="bg-gradient-to-br from-[hsl(var(--primary-light)/0.3)] to-[hsl(var(--primary)/0.2)] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <MessageSquare className="w-6 h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2 flex items-center justify-center gap-1">
              <span>Conversations</span>
              <span className="text-sm">💬</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Unload your thoughts, we make them into a list.
            </p>
            <div className="mt-2 text-[10px] text-[hsl(var(--primary)/0.7)] font-medium">(not lists!)</div>
          </div>

          {/* Card 2 */}
          <div className="bg-card rounded-xl p-4 sm:p-6 border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)] text-center transform transition-transform hover:translate-x-[5px] duration-300 rotate-[-0.5deg]"
            data-aos="fade-right">
            <div className="bg-gradient-to-br from-[hsl(var(--primary-light)/0.3)] to-[hsl(var(--secondary)/0.2)] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <SunMoon className="w-6 h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2 flex items-center justify-center gap-1">
              <span>Flexible Plans</span>
              <span className="text-sm">🌊</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Life changes, we call to check how you&apos;re doing. We update your plan as needed.
            </p>
            <div className="mt-2 text-[10px] text-[hsl(var(--primary)/0.7)] italic">Rigid plans are so 2019...</div>
          </div>

          {/* Card 3 */}
          <div className="bg-[hsl(var(--secondary)/0.1)] rounded-xl p-4 sm:p-6 border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)] text-center transform transition-transform hover:translate-x-[-5px] duration-300 rotate-[0.7deg]"
            data-aos="fade-left">
            <div className="bg-gradient-to-br from-[hsl(var(--secondary)/0.3)] to-[hsl(var(--primary-light)/0.2)] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Bell className="w-6 h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2 flex items-center justify-center gap-1">
              <span>If you tend to forget things--This is for you</span>
              <span className="text-sm">🤗</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              A nudge that feels supportive, never shaming.
            </p>
            <div className="mt-2 text-[10px] text-[hsl(var(--primary)/0.7)] font-medium">(no passive-aggressive alerts)</div>
          </div>

          {/* Card 4 */}
          <div ref={card4Ref} className="bg-card rounded-xl p-4 sm:p-6 border border-[hsl(var(--border))] shadow-sm transition-all hover:shadow-md hover:border-[hsl(var(--primary)/0.2)] text-center transform transition-transform hover:translate-y-[5px] duration-300 rotate-[-0.7deg] relative overflow-hidden"
            data-aos="fade-up">
            <div className="bg-gradient-to-br from-[hsl(var(--primary)/0.2)] to-[hsl(var(--secondary)/0.3)] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 relative overflow-hidden shadow-inner">
              <Sparkles className="w-6 h-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2 flex items-center justify-center gap-1">
              <span>Progress over Perfection</span>
              <span className="text-sm">🎉</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              We celebrate your wins, however small.
            </p>
            <div className="mt-2 text-[10px] text-[hsl(var(--primary)/0.7)] font-medium">
              (hover for confetti!)
            </div>
          </div>
        </div>

        {/* Closing Line */}
        <div className="text-center mb-8 relative">
          <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 text-3xl animate-bounce-slow hidden md:block">👋</div>
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 text-3xl animate-bounce-slow hidden md:block">👋</div>

          <p className="text-xl font-medium text-foreground bg-[hsl(var(--secondary)/0.05)] py-4 px-6 rounded-lg inline-block">
            <span className="text-2xl mr-2">{activeEmoji}</span>
            It&apos;s still early — but if you&apos;ve felt this pain, and want to help shape the solution, join us as a pilot user.
          </p>
        </div>

        {/* Join the Pilot Button */}
        <div className="text-center">
          <button className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] hover:from-[hsl(var(--primary-light))] hover:to-[hsl(var(--primary))] text-white font-medium py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto">
            <span>Join the Pilot</span>
            <Heart className="w-4 h-4" />
          </button>
          <p className="text-xs text-muted-foreground mt-3">No pressure, we&apos;re just happy you&apos;re here! <Smile className="w-3 h-3 inline" /></p>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes sparkle {
          0% { box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(var(--primary-rgb), 0); }
          100% { box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0); }
        }
        .sparkle-animation {
          animation: sparkle 1s ease-out;
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
          50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #f00;
          opacity: 0.8;
          animation: confetti-fall 2s linear forwards;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(100px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default WhatWereBuilding;