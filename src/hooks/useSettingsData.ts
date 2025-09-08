import { useCalendarSettingsData } from "./useCalendarSettingsData";
import { useClarityCallsSettingsData } from "./useClarityCallsSettingsData";

/**
 * Combined hook for all settings data management
 * Coordinates data from calendar and clarity calls settings
 */
export function useSettingsData() {
  // Individual settings data hooks
  const calendarData = useCalendarSettingsData();
  const clarityCallsData = useClarityCallsSettingsData();

  // Combined loading state
  const isLoading = calendarData.isLoading || clarityCallsData.isLoading;

  // Combined error state (prioritize calendar errors if both exist)
  const error = calendarData.error || clarityCallsData.error;

  // Return combined interface
  return {
    // Calendar data
    calendar: {
      calendars: calendarData.calendars,
      primaryCalendar: calendarData.primaryCalendar,
      otherCalendars: calendarData.otherCalendars,
      isLoading: calendarData.isLoading,
      error: calendarData.error,
      actions: calendarData.actions,
    },

    // Clarity calls data
    clarityCalls: {
      user: clarityCallsData.user,
      isCallsEnabled: clarityCallsData.isCallsEnabled,
      hasCallTime: clarityCallsData.hasCallTime,
      isLoading: clarityCallsData.isLoading,
      isUpdating: clarityCallsData.isUpdating,
      error: clarityCallsData.error,
      actions: clarityCallsData.actions,
    },

    // Combined states
    isLoading,
    error,
  };
}