import React, { useState, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { LinkButton } from "../ui/CustomButton";

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

const CalendarSettingsCard = () => {
  const user = useQuery(api.core.users.queries.getCurrentUser, {});
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);
  const [primaryCalendar, setPrimaryCalendar] = useState<CalendarItem | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserCalendars = useAction(
    api.core.calendars.actions.getUserCalendars
  );

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

  const handleFeedbackClick = () => {
    // Open feedback collection - could be a modal, form, or mailto
    const otherCalendarNames = calendars
      .filter((cal) => !cal.primary)
      .map((cal) => cal.summary)
      .join(", ");

    const subject = "Calendar Integration Feedback";
    const body = `I have other calendars (${otherCalendarNames}) that might have important events for work planning.`;

    window.open(`mailto:feedback@yourapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  // Loading state
  if (user === undefined || (user !== null && isLoading)) {
    return (
      <div className="bg-white rounded-xl border border-slate-50 p-6 hover:border-slate-100 transition-all duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg transition-colors duration-200">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900">Calendar Access</h3>
            <p className="text-sm text-slate-600">
              Which calendar should we use in our planning sessions?
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Getting your calendars ready…</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-50 p-6 hover:border-slate-100 transition-all duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg transition-colors duration-200">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900">Calendar Access</h3>
            <p className="text-sm text-slate-600">
              Which calendar should we use in your working sessions?
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-800">
              Couldn&apos;t reach your calendars right now.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-red-700 hover:text-red-800 underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const otherCalendars = calendars.filter((cal) => !cal.primary);

  return (
    <div className="bg-white rounded-xl border border-slate-50 p-6 hover:border-slate-100 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg transition-colors duration-200">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-slate-900">Calendar Access</h3>
          <p className="text-sm text-slate-600">
            Which calendar should we use in your working sessions?
          </p>
        </div>
      </div>

      {/* Primary Calendar - Active */}
      {primaryCalendar && (
        <div className="group mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:scale-[1.01] transition-all duration-200">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  primaryCalendar.backgroundColor || "#3F83F8",
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900 truncate">
                  {primaryCalendar.summary}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  Active
                </span>
              </div>
              <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-slate-500 mt-1">
                We&apos;ll check it when planning for the day.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Other Calendars - Research CTA */}
      {otherCalendars.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-medium text-slate-900">Other calendars</h4>
            <span className="text-xs text-slate-500">
              ({otherCalendars.length})
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {otherCalendars.slice(0, 3).map((calendar) => (
              <div key={calendar.id} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: calendar.backgroundColor || "#94A3B8",
                  }}
                />
                <p className="text-sm text-slate-600 truncate">
                  {calendar.summary}
                </p>
              </div>
            ))}
            {otherCalendars.length > 3 && (
              <p className="text-xs text-slate-500 ml-4">
                and {otherCalendars.length - 3} more...
              </p>
            )}
          </div>

          <div className="flex justify-start">
            <LinkButton
              inline
              hint="We have not integrated these for simplicity. If we are missing important events please let us know."
              onClick={handleFeedbackClick}>
              Request Integration for all the calendars!
            </LinkButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSettingsCard;