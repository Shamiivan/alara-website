import { useState, useEffect, useCallback } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

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

/**
 * Custom hook for calendar settings data management
 * Follows the architecture guidelines: data fetching, actions, and derived state in one place
 */
export function useCalendarSettingsData() {
  // Data fetching
  const user = useQuery(api.core.users.queries.getCurrentUser, {});

  // Actions
  const getUserCalendars = useAction(api.core.calendars.actions.getUserCalendars);

  // Local state for data
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);
  const [primaryCalendar, setPrimaryCalendar] = useState<CalendarItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load calendars effect
  useEffect(() => {
    const loadCalendars = async () => {
      if (user === undefined) return;
      if (user === null) {
        setIsLoading(false);
        setError("Please sign in to view your calendars.");
        return;
      }
      try {
        const result = await getUserCalendars({ userId: user._id });
        if (result.success) {
          setCalendars(result.data.calendars);
          setPrimaryCalendar(result.data.primaryCalendar);
          setError(null);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Couldn't reach your calendars right now.");
      } finally {
        setIsLoading(false);
      }
    };
    loadCalendars();
  }, [user, getUserCalendars]);

  // Derived data
  const otherCalendars = calendars.filter((cal) => !cal.primary);

  // Action handlers
  const handleFeedbackClick = useCallback(() => {
    const otherCalendarNames = calendars
      .filter((cal) => !cal.primary)
      .map((cal) => cal.summary)
      .join(", ");

    const subject = "Calendar Integration Feedback";
    const body = `I have other calendars (${otherCalendarNames}) that might have important events for work planning.`;

    window.open(`mailto:feedback@yourapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }, [calendars]);

  // Return standardized interface
  return {
    // Data
    calendars,
    primaryCalendar,
    otherCalendars,

    // Loading states
    isLoading: user === undefined || isLoading,

    // Error state
    error,

    // Actions
    actions: {
      handleFeedbackClick,
    },
  };
}