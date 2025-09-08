import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import NextCallCard from "@/components/dashboard/NextCallCard";
import Rolling7DayStrip from "@/components/calendar/WeekSectionComponent";
import { Section, Card } from "@/components/primitives/layouts";
import { FeaturesList } from "@/components/dashboard/FeaturesList";

export function DashboardView() {
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = "Hello";

    if (hour < 12) newGreeting = "Good morning";
    else if (hour < 17) newGreeting = "Good afternoon";
    else newGreeting = "Good evening";

    setGreeting(newGreeting);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    setMounted(true);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const containerClasses = `flex flex-col gap-8 opacity-${mounted ? '100' : '0'} transform ${mounted ? 'translate-y-0' : 'translate-y-2'} transition-all duration-500`;

  const contentGridClasses = "grid gap-6";

  const twoColumnGridClasses = `grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`;

  return (
    <div className={containerClasses}>
      <PageHeader
        title="Dashboard"
        description={`${greeting}! Here's your productivity overview`}
        icon={<Sparkles size={24} color="#fbbf24" className="animate-pulse" />}
      />

      <div className={contentGridClasses}>

        {/* Content Grid - Two Column on Desktop */}
        {/* Calendar Section */}
        <Card variant="elevated" className="overflow-hidden">
          <div className="p-5 pb-1">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Calendar
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your schedule at a glance
            </p>
          </div>
          <Rolling7DayStrip />
        </Card>

        {/* Features Card */}
        <Card variant="elevated" padding="lg">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Features
          </h3>
          <FeaturesList isMobile={isMobile} />
        </Card>
      </div>
    </div>
  );
}