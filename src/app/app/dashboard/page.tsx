"use client";

import { useState, useEffect } from "react";
import NextCallCard from "@/components/dashboard/NextCallCard";
import { TOKENS } from "@/components/tokens";
import { Sparkles, Star, Zap, Check, Smile } from "lucide-react";
import CalendarComponent from "@/components/calendar/CalendarComponent";

export default function DashboardPage() {
  // Track if component has mounted for animations
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Hello");

  // Get appropriate greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = "Hello";

    if (hour < 12) newGreeting = "Good morning";
    else if (hour < 17) newGreeting = "Good afternoon";
    else newGreeting = "Good evening";

    setGreeting(newGreeting);
    setMounted(true);

    // Add a gentle entrance effect
    const timer = setTimeout(() => {
      const welcomeEl = document.getElementById('welcome-text');
      if (welcomeEl) welcomeEl.classList.add('float-effect');
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header with staggered animation */}
      <div
        className="flex flex-col gap-2 sm:gap-3"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}
      >
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: TOKENS.text }}>Dashboard</h1>
          <Sparkles className="h-5 w-5 text-yellow-500 pulse-subtle" aria-hidden="true" />
        </div>
        <p
          id="welcome-text"
          className="text-lg transition-all duration-500"
          style={{ color: TOKENS.subtext }}
        >
          {greeting}! Welcome to your Alara dashboard
        </p>
      </div>

      <div
        className="p-4 sm:p-6 rounded-[16px] border bg-white"
        style={{
          borderColor: TOKENS.border,
          boxShadow: TOKENS.shadow,
          animation: mounted ? "fadeInUp 550ms ease forwards" : "none",
          opacity: mounted ? 1 : 0
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-orange-500 wiggle-effect" />
          <h2 className="text-lg font-semibold" style={{ color: TOKENS.text }}>Getting Started</h2>
        </div>

        <p className="text-base mb-4" style={{ color: TOKENS.subtext }}>
          This dashboard is part of the new mobile-first layout. Here&apos;s what you can do:
        </p>

        <ul className="space-y-3 mb-6">
          {[
            { icon: <Check size={18} />, text: "Toggle the sidebar using the button in the top corner" },
            { icon: <Zap size={18} />, text: "Navigate easily between Dashboard, Calls, and Tasks" },
            { icon: <Check size={18} />, text: "The sidebar collapses to icons-only on desktop" },
            { icon: <Check size={18} />, text: "On mobile, it transforms into a full-screen overlay" },
            { icon: <Smile size={18} />, text: "Your sidebar state is remembered between sessions" }
          ].map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-3 hover-lift"
              style={{
                color: TOKENS.subtext,
                animationDelay: `${index * 150}ms`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
                transition: `opacity 0.3s ease ${index * 100}ms, transform 0.3s ease ${index * 100}ms`
              }}
            >
              <span className="mt-0.5 text-indigo-500">{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-lg p-1 hover-lift" style={{ background: TOKENS.accent, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease 300ms' }}>
          <NextCallCard
            onSave={() => { }}
            onCancel={() => { }}
            compact={true}
          />
        </div>
        <div className="mt-8 rounded-lg p-1 hover-lift" style={{ background: TOKENS.accent, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease 300ms' }}>
          <CalendarComponent />
        </div>
      </div>
    </div>
  );
}
