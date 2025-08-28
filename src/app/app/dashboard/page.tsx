"use client";

import { useState, useEffect } from "react";
import NextCallCard from "@/components/dashboard/NextCallCard";
import { TOKENS } from "@/components/tokens";
import { Sparkles, Star, Zap, Check, Smile, Clock, Calendar } from "lucide-react";
import CalendarComponent from "@/components/calendar/CalendarComponent";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = "Hello";

    if (hour < 12) newGreeting = "Good morning";
    else if (hour < 17) newGreeting = "Good afternoon";
    else newGreeting = "Good evening";

    setGreeting(newGreeting);
    setMounted(true);
  }, []);

  const features = [
    { icon: <Check size={18} />, text: "Toggle the sidebar using the menu button", color: "text-emerald-500" },
    { icon: <Zap size={18} />, text: "Navigate easily between Dashboard, Calls, and Tasks", color: "text-blue-500" },
    { icon: <Clock size={18} />, text: "Sidebar slides smoothly on mobile and desktop", color: "text-purple-500" },
    { icon: <Calendar size={18} />, text: "Responsive layout adapts to any screen size", color: "text-orange-500" },
    { icon: <Smile size={18} />, text: "Touch-friendly with 44px minimum tap targets", color: "text-pink-500" }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <header className="page-header">
        <div className="flex items-center gap-3">
          <h1 className="page-title">Dashboard</h1>
          <Sparkles className="h-6 w-6 text-amber-500 animate-subtle-bounce" aria-hidden="true" />
        </div>
        <p className="page-description">
          {greeting}! Here's your productivity overview
        </p>
      </header>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:gap-8">
        {/* Welcome Card */}
        <div className="card-base p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Welcome to your mobile-first layout
              </h2>
              <p className="text-muted-foreground mb-4">
                This layout prioritizes mobile usability while maintaining desktop functionality.
              </p>

              <ul className="space-y-3">
                {features.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 animate-slideInLeft"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      opacity: mounted ? 1 : 0
                    }}
                  >
                    <span className={`mt-0.5 ${item.color}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Content Grid - Two Column on Desktop */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Next Call Section */}
          <div className="card-base p-1 overflow-hidden">
            <div className="p-5 pb-1">
              <h3 className="text-base font-semibold text-foreground mb-2">
                Next Call
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your upcoming conversations
              </p>
            </div>
            <NextCallCard
              onSave={() => { }}
              onCancel={() => { }}
              compact={true}
            />
          </div>

          {/* Calendar Section */}
          <div className="card-base p-1 overflow-hidden">
            <div className="p-5 pb-1">
              <h3 className="text-base font-semibold text-foreground mb-2">
                Calendar
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your schedule at a glance
              </p>
            </div>
            <CalendarComponent />
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="card-base p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">
            Layout Features
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Touch Optimized</p>
                <p className="text-xs text-muted-foreground">44px minimum targets</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Responsive Grid</p>
                <p className="text-xs text-muted-foreground">Adapts to all screens</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 sm:col-span-2 lg:col-span-1">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Smile className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Smooth Animations</p>
                <p className="text-xs text-muted-foreground">Reduced motion support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}