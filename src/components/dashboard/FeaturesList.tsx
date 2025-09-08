import React from "react";
import { Check, Zap, Clock, Calendar, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  { iconName: "Check", text: "Toggle the sidebar using the menu button", color: "#10b981" },
  { iconName: "Zap", text: "Navigate easily between Dashboard, Calls, and Tasks", color: "#3b82f6" },
  { iconName: "Clock", text: "Sidebar slides smoothly on mobile and desktop", color: "#8b5cf6" },
  { iconName: "Calendar", text: "Responsive layout adapts to any screen size", color: "#f59e0b" },
  { iconName: "Smile", text: "Touch-friendly with 44px minimum tap targets", color: "#ec4899" }
] as const;

const iconMap = {
  Check: Check,
  Zap: Zap,
  Clock: Clock,
  Calendar: Calendar,
  Smile: Smile,
};

interface FeatureItemProps {
  iconName: string;
  text: string;
  color: string;
}

function FeatureItem({ iconName, text, color }: FeatureItemProps) {
  const IconComponent = iconMap[iconName as keyof typeof iconMap];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <IconComponent size={16} color={color} />
      </div>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
}

interface FeaturesListProps {
  isMobile?: boolean;
}

export function FeaturesList({ isMobile }: FeaturesListProps) {
  return (
    <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
      {FEATURES.map((feature) => (
        <FeatureItem key={feature.text} {...feature} />
      ))}
    </div>
  );
}