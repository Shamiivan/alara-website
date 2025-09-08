import React from "react";
import { CalendarSettingsView } from "./CalendarSettingsView";
import { ClarityCallsSettingsView } from "./ClarityCallsSettingsView";

interface User {
  _id: string;
  callTime?: string;
  timezone?: string;
  wantsClarityCalls?: boolean;
}

type CalendarItem = {
  id: string;
  summary: string;
  description?: string;
  timeZone: string;
  accessRole: string;
  primary?: boolean;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
};

interface SettingsViewProps {
  // Calendar data
  calendar: {
    calendars: CalendarItem[];
    primaryCalendar: CalendarItem | null;
    otherCalendars: CalendarItem[];
    isLoading: boolean;
    error: string | null;
    actions: {
      handleFeedbackClick: () => void;
    };
  };

  // Clarity calls data
  clarityCalls: {
    user: User | null | undefined;
    isCallsEnabled: boolean;
    hasCallTime: boolean;
    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;
    actions: {
      handleToggleCalls: (enabled: boolean) => Promise<boolean>;
      handleSaveTime: (time: string) => Promise<boolean>;
    };
  };

  // Combined states
  isLoading: boolean;
  error: string | null;
}

export function SettingsView({
  calendar,
  clarityCalls,
}: SettingsViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-[#64748B]">Manage your account and application preferences</p>
      </div>

      {/* Settings Cards */}
      <CalendarSettingsView
        calendars={calendar.calendars}
        primaryCalendar={calendar.primaryCalendar}
        otherCalendars={calendar.otherCalendars}
        isLoading={calendar.isLoading}
        error={calendar.error}
        onFeedbackClick={calendar.actions.handleFeedbackClick}
      />

      <ClarityCallsSettingsView
        user={clarityCalls.user}
        isCallsEnabled={clarityCalls.isCallsEnabled}
        hasCallTime={clarityCalls.hasCallTime}
        isLoading={clarityCalls.isLoading}
        isUpdating={clarityCalls.isUpdating}
        error={clarityCalls.error}
        onToggleCalls={clarityCalls.actions.handleToggleCalls}
        onSaveTime={clarityCalls.actions.handleSaveTime}
      />
    </div>
  );
}