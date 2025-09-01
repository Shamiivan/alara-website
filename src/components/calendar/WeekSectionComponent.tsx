import React, { useEffect, useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

// ========================================
// TYPES
// ========================================

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  relativeTime: string;
  category: 'work' | 'personal' | 'health';
}

interface CardProps {
  date: Date;
  events: Event[];
  isLoading?: boolean;
}

interface FutureCardProps extends CardProps {
  dayOffset: number;
}

// ========================================
// HELPERS
// ========================================

const formatShortDate = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const getRelativeTime = (eventTime: string, referenceDate: Date): string => {
  const eventDate = new Date(eventTime);
  const now = new Date();
  const diffMs = eventDate.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  // If it's yesterday or past, show time
  if (referenceDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    return eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // Today - show relative time
  if (diffHours > 0) {
    return `in ${diffHours}h`;
  } else if (diffMinutes > 0) {
    return `in ${diffMinutes}m`;
  } else if (diffMinutes > -60) {
    return `${Math.abs(diffMinutes)}m ago`;
  } else {
    return `${Math.abs(diffHours)}h ago`;
  }
};

const categorizeEvent = (summary: string): 'work' | 'personal' | 'health' => {
  const lower = summary.toLowerCase();
  if (lower.includes('meeting') || lower.includes('call') || lower.includes('standup') || lower.includes('sync')) {
    return 'work';
  }
  if (lower.includes('doctor') || lower.includes('workout') || lower.includes('gym') || lower.includes('health')) {
    return 'health';
  }
  return 'personal';
};

// ========================================
// LOADING CARD
// ========================================

const LoadingCard: React.FC<{ width: string; height: string }> = ({ width, height }) => (
  <div className={`rounded-xl bg-muted/10 p-3 ${width} ${height} animate-pulse`}>
    <div className="flex items-center justify-between mb-2">
      <div className="w-4 h-4 bg-muted/30 rounded"></div>
      <div className="w-16 h-3 bg-muted/30 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="w-full h-3 bg-muted/30 rounded"></div>
      <div className="w-3/4 h-3 bg-muted/30 rounded"></div>
    </div>
  </div>
);

// ========================================
// YESTERDAY CARD
// ========================================

const YesterdayCardComponent: React.FC<CardProps> = ({ date, events, isLoading }) => {
  const messages = [
    "Yesterday is done — great job keeping momentum!",
    "Yesterday wrapped — today's a fresh start.",
    "You closed out yesterday. That's progress."
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];

  if (isLoading) {
    return <LoadingCard width="w-full md:w-[260px]" height="min-h-[220px]" />;
  }

  return (
    <div className="rounded-xl bg-muted/20 p-3 w-full md:w-[260px] min-h-[220px]
                    transition-transform duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-foreground">
          {date.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          {formatShortDate(date)}
        </div>
      </div>

      <div className="text-xs italic text-muted-foreground mb-2">
        {events.length === 0 ? message : "Yesterday's completed events"}
      </div>

      <div className="space-y-2">
        {events.slice(0, 4).map(e => (
          <div key={e.id} className="text-xs text-foreground">
            <div className="font-medium truncate">{e.title}</div>
            <div className="text-muted-foreground">{e.relativeTime}</div>
          </div>
        ))}
        {events.length > 4 && (
          <div className="text-xs text-muted-foreground">
            +{events.length - 4} more events
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================
// TODAY CARD
// ========================================

const TodayCardComponent: React.FC<CardProps> = ({ date, events, isLoading }) => {
  const messages = [
    "Today's focus — what's one step you can take?",
    "Today's wide open — add something meaningful.",
    "Today's your chance — start small, build momentum."
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];

  if (isLoading) {
    return <LoadingCard width="w-full md:w-[380px]" height="min-h-[380px]" />;
  }

  return (
    <div className="bg-white rounded-xl p-4 w-full md:w-[380px] min-h-[380px] shadow-sm
                    transition-transform duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-slate-900">
          {date.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
        <div className="text-xs font-medium text-slate-900 bg-blue-50 px-2 py-0.5 rounded-full">
          {formatShortDate(date)}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-sm text-blue-700 mb-3 bg-blue-50/80 px-3 py-2 rounded-lg">
          {message}
        </div>
      ) : (
        <div className="text-sm font-medium text-slate-900 mb-3">Today's Schedule</div>
      )}

      <div className="space-y-2">
        {events.slice(0, 6).map(e => (
          <div key={e.id} className="text-sm text-foreground">
            <div className="font-medium truncate">{e.title}</div>
            <div className="text-blue-700">{e.relativeTime}</div>
          </div>
        ))}
        {events.length > 6 && (
          <div className="text-sm text-muted-foreground">
            +{events.length - 6} more events
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================
// FUTURE CARD
// ========================================

const FutureCardComponent: React.FC<FutureCardProps> = ({ date, events, dayOffset, isLoading }) => {
  const messages = [
    "Tomorrow's uncharted — what will you explore?",
    "A blank map — mark your path.",
    "A day wide open — where will it take you?",
    "Nothing set — launch something bold?"
  ];
  const emojis = ["🌌", "🗺", "🏞", "🚀", "⭐"];
  const emoji = emojis[dayOffset % emojis.length];
  const message = messages[dayOffset % messages.length];

  if (isLoading) {
    return <LoadingCard width="w-full md:w-[260px]" height="min-h-[220px]" />;
  }

  return (
    <div className="rounded-xl bg-muted/10 p-3 w-full md:w-[260px] min-h-[220px]
                    transition-transform duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-1">
        <div className="text-base">{emoji}</div>
        <div className="text-xs font-medium text-foreground">
          {formatShortDate(date)}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-xs italic text-muted-foreground p-1 rounded-md mb-2">
          {message}
        </div>
      ) : (
        <div className="text-xs font-medium text-foreground mb-2">Planned</div>
      )}

      <div className="space-y-2">
        {events.slice(0, 4).map(e => (
          <div key={e.id} className="text-xs text-foreground">
            <div className="font-medium truncate">{e.title}</div>
            <div className="text-muted-foreground">{e.relativeTime}</div>
          </div>
        ))}
        {events.length > 4 && (
          <div className="text-xs text-muted-foreground">
            +{events.length - 4} more events
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================
// WEEK SECTION WITH DATA FETCHING
// ========================================

const WeekSectionComponent: React.FC = () => {
  const user = useQuery(api.core.users.queries.getCurrentUser, {});
  const [eventsByDay, setEventsByDay] = useState<Record<string, Event[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserCalendars = useAction(api.core.calendars.actions.getUserCalendars);
  const getCalendarEvents = useAction(api.core.calendars.actions.getCalendarEvents);

  const today = new Date();
  const days = [
    { date: new Date(today.getTime() - 86400000), type: 'yesterday', offset: -1 },
    { date: today, type: 'today', offset: 0 },
    ...[1, 2, 3, 4, 5].map(i => ({
      date: new Date(today.getTime() + i * 86400000),
      type: 'future',
      offset: i
    }))
  ] as const;

  const formatDayKey = (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const loadCalendarData = async () => {
    if (user === undefined) return; // Still loading user
    if (user === null) {
      setError("Please sign in to view your calendar");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get user calendars
      const calendarsResult = await getUserCalendars({ userId: user._id });

      if (!calendarsResult.success) {
        setError(calendarsResult.error);
        return;
      }

      const primaryCalendar = calendarsResult.data.primaryCalendar;
      if (!primaryCalendar) {
        setError("No primary calendar found");
        return;
      }

      // Get events for the 7-day range
      const startDate = new Date(today.getTime() - 86400000); // Yesterday
      const endDate = new Date(today.getTime() + 5 * 86400000); // 5 days ahead

      const eventsResult = await getCalendarEvents({
        userId: user._id,
        calendarId: primaryCalendar.id,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
      });

      if (!eventsResult.success) {
        setError(eventsResult.error);
        return;
      }

      // Group events by day
      const groupedEvents: Record<string, Event[]> = {};

      days.forEach(day => {
        const dayKey = formatDayKey(day.date);
        groupedEvents[dayKey] = [];
      });

      eventsResult.data.events.forEach(event => {
        const eventDate = new Date(event.start.dateTime || event.start.date);
        const dayKey = formatDayKey(eventDate);

        if (groupedEvents[dayKey] !== undefined) {
          groupedEvents[dayKey].push({
            id: event.id,
            title: event.summary,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            relativeTime: getRelativeTime(event.start.dateTime || event.start.date, eventDate),
            category: categorizeEvent(event.summary)
          });
        }
      });

      // Sort events by time for each day
      Object.keys(groupedEvents).forEach(dayKey => {
        groupedEvents[dayKey].sort((a, b) =>
          new Date(a.start).getTime() - new Date(b.start).getTime()
        );
      });

      setEventsByDay(groupedEvents);
    } catch (err) {
      console.error('[WeekSection] Error loading calendar data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load calendar data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user === null || user === undefined) return;

    // Initial load
    loadCalendarData();

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      loadCalendarData();
    }, 60 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  // Refresh when tab becomes visible (user switches back to tab)
  useEffect(() => {
    if (user === null || user === undefined) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadCalendarData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Handle loading and error states early
  if (user === undefined) {
    return (
      <div className="w-full">
        {/* Desktop loading */}
        <div className="hidden md:flex gap-3 overflow-x-auto pb-4 px-4">
          {[...Array(7)].map((_, i) => (
            <LoadingCard key={i} width="w-[260px]" height="min-h-[220px]" />
          ))}
        </div>
        {/* Mobile loading */}
        <div className="md:hidden space-y-3 px-4">
          {[...Array(7)].map((_, i) => (
            <LoadingCard key={i} width="w-full" height="min-h-[220px]" />
          ))}
        </div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-700 mb-2">Sign in required</div>
        <div className="text-xs text-blue-600">Please sign in to see your calendar events</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-sm text-red-700 mb-2">Unable to load calendar events</div>
        <div className="text-xs text-red-600 mb-3">{error}</div>
        <button
          onClick={loadCalendarData}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop version */}
      <div className="hidden md:flex gap-3 overflow-x-auto pb-4 px-4">
        {days.map((d, i) => {
          const dayKey = formatDayKey(d.date);
          const dayEvents = eventsByDay[dayKey] || [];

          if (d.type === 'yesterday') {
            return (
              <YesterdayCardComponent
                key={i}
                date={d.date}
                events={dayEvents}
                isLoading={isLoading}
              />
            );
          } else if (d.type === 'today') {
            return (
              <TodayCardComponent
                key={i}
                date={d.date}
                events={dayEvents}
                isLoading={isLoading}
              />
            );
          } else {
            return (
              <FutureCardComponent
                key={i}
                date={d.date}
                events={dayEvents}
                dayOffset={d.offset - 1}
                isLoading={isLoading}
              />
            );
          }
        })}
      </div>

      {/* Mobile version */}
      <div className="md:hidden space-y-3 px-4">
        {days.map((d, i) => {
          const dayKey = formatDayKey(d.date);
          const dayEvents = eventsByDay[dayKey] || [];

          if (d.type === 'yesterday') {
            return (
              <div key={i} className="w-full">
                <YesterdayCardComponent
                  date={d.date}
                  events={dayEvents}
                  isLoading={isLoading}
                />
              </div>
            );
          } else if (d.type === 'today') {
            return (
              <div key={i} className="w-full">
                <TodayCardComponent
                  date={d.date}
                  events={dayEvents}
                  isLoading={isLoading}
                />
              </div>
            );
          } else {
            return (
              <div key={i} className="w-full">
                <FutureCardComponent
                  date={d.date}
                  events={dayEvents}
                  dayOffset={d.offset - 1}
                  isLoading={isLoading}
                />
              </div>
            );
          }
        })}
      </div>

    </div>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================

export default function Rolling7DayStrip(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-foreground mb-1">The Next Seven Sunrises</h1>
          <p className="text-xs text-muted-foreground">
            "Yesterday is history, tomorrow is a mystery, today is a gift, that's why we call it the present" --Master Oogway
          </p>
        </div>
        <WeekSectionComponent />
      </div>
    </div>
  );
}