import { v } from "convex/values";
import { action, internalQuery, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { CalendarEventsResponse, GoogleCalendarEvent } from "./types/calendar";



export const upsertTokens = mutation({
  args: {
    userId: v.id("users"),
    userEmail: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAtMs: v.number(),
  },
  async handler(ctx, args_0) {
    try {
      const existing = await ctx.db.query("googleTokens")
        .withIndex("by_user", (q) => q.eq("userId", args_0.userId)).unique();
      const date = Date.now();
      if (existing) {
        return await ctx.db.patch(existing._id, {
          accessToken: args_0.accessToken,
          expiresAtMs: args_0.expiresAtMs,
          updatedAt: date,
        });
      } else {
        return await ctx.db.insert("googleTokens", {
          userId: args_0.userId,
          userEmail: args_0.userEmail,
          accessToken: args_0.accessToken,
          refreshToken: args_0.refreshToken,
          expiresAtMs: args_0.expiresAtMs,
          createdAt: date,
          updatedAt: date,
        });
      }
    } catch (error) {
    }
  },
});

export const isCalendarConnected = query({
  args: {
    userId: v.id("users"),
  },
  async handler(ctx, args_0) {
    const account = await ctx.db.query("googleTokens")
      .withIndex("by_user", (q) => q.eq("userId", args_0.userId)).unique();
    if (account?.refreshToken && account?.accessToken && account?.expiresAtMs > Date.now()) {
      return { connected: true, email: account.userEmail };
    }
    return { connected: false, email: null };
  },

});
export const getTokenById = internalQuery({
  args: {
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const account = await ctx.db.query("googleTokens")
      .withIndex("by_user", (q) => q.eq("userId", args.userId)).unique();
    return account;
  }
});


export const getFreeBusy = action({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, { userId }) => {

    try {
      console.log("Action has been called");
      // get the token by users
      const tokenRow = await ctx.runQuery(internal.calendar.getTokenById, { userId });

      if (!tokenRow) throw new Error("The token received is invalid");
      // If token is expired, refresh it
      const isExpired = Date.now() + 30_000 >= tokenRow.expiresAtMs;
      let newTokens;
      if (isExpired) {
        console.log("Token is expired");
        newTokens = await ctx.runAction(internal.utils.tokens.refreshToken, { tokenId: tokenRow._id })
        console.log("new token", newTokens)
      } else {
        console.log("Token is not expired", newTokens);
        newTokens = tokenRow.accessToken;
      }


      // Continue with the original operation using the valid token
      return { success: true, message: "Token check and refresh completed" };
    } catch (error) {
      console.log("[getFreeBUsy]-Error", error)
      return { success: false, data: error }
    }
  }
});

// New action to get user's calendars
export const getUserCalendars = action({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, { userId }) => {
    try {
      console.log("Getting user calendars for userId:", userId);

      // Get the token by user
      const tokenRow = await ctx.runQuery(internal.calendar.getTokenById, { userId });
      if (!tokenRow) throw new Error("The token received is invalid");

      // Check if token is expired and refresh if needed
      const isExpired = Date.now() + 30_000 >= tokenRow.expiresAtMs;
      let accessToken;

      if (isExpired) {
        console.log("Token is expired, refreshing...");
        const refreshResult = await ctx.runAction(internal.utils.tokens.refreshToken, { tokenId: tokenRow._id });

        if (!refreshResult.success || !refreshResult.accessToken) {
          throw new Error(`Token refresh failed: ${refreshResult.error}`);
        }
        accessToken = refreshResult.accessToken;
      } else {
        console.log("Token is valid");
        accessToken = tokenRow.accessToken;
      }

      // Fetch calendars from Google Calendar API
      const calendarResponse = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!calendarResponse.ok) {
        const errorText = await calendarResponse.text();
        throw new Error(`Calendar API error: ${calendarResponse.status} - ${errorText}`);
      }
      console.log("Response", calendarResponse);

      const calendarData = await calendarResponse.json() as {
        items: Array<{
          id: string;
          summary: string;
          description?: string;
          timeZone: string;
          accessRole: string;
          primary?: boolean;
          selected?: boolean;
          colorId?: string;
          backgroundColor?: string;
          foregroundColor?: string;
        }>;
        nextPageToken?: string;
      };

      console.log(`Found ${calendarData.items?.length || 0} calendars`);
      console.log("Calendar", calendarData)

      // Find the primary calendar
      const primaryCalendar = calendarData.items?.find(cal => cal.primary === true);


      //get the calendar 


      return {
        success: true,
        data: {
          calendars: calendarData.items || [],
          primaryCalendar: primaryCalendar || null,
          totalCount: calendarData.items?.length || 0
        }
      };

    } catch (error) {
      console.log("[getUserCalendars] Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  }
});
// Get events from a specific calendar
export const getCalendarEvents = action({
  args: {
    userId: v.id("users"),
    calendarId: v.string(),
    timeMin: v.optional(v.string()), // RFC3339 format (e.g., "2024-01-01T00:00:00Z")
    timeMax: v.optional(v.string()), // RFC3339 format
    maxResults: v.optional(v.number()), // Default 250, max 2500
    singleEvents: v.optional(v.boolean()), // Expand recurring events
  },
  handler: async (ctx, { userId, calendarId, timeMin, timeMax, maxResults = 250, singleEvents = true }) => {
    try {
      console.log(`Getting events for calendar: ${calendarId}`);

      // Get the token by user
      const tokenRow = await ctx.runQuery(internal.calendar.getTokenById, { userId });
      if (!tokenRow) throw new Error("The token received is invalid");

      // Check if token is expired and refresh if needed
      const isExpired = Date.now() + 30_000 >= tokenRow.expiresAtMs;
      let accessToken;

      if (isExpired) {
        console.log("Token is expired, refreshing...");
        const refreshResult = await ctx.runAction(internal.utils.tokens.refreshToken, { tokenId: tokenRow._id });

        if (!refreshResult.success || !refreshResult.accessToken) {
          throw new Error(`Token refresh failed: ${refreshResult.error}`);
        }
        accessToken = refreshResult.accessToken;
      } else {
        accessToken = tokenRow.accessToken;
      }

      // Build query parameters
      const params = new URLSearchParams({
        maxResults: maxResults.toString(),
        singleEvents: singleEvents.toString(),
        orderBy: "startTime",
      });

      if (timeMin) params.append("timeMin", timeMin);
      if (timeMax) params.append("timeMax", timeMax);

      // Fetch events from Google Calendar API
      const eventsResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!eventsResponse.ok) {
        const errorText = await eventsResponse.text();
        throw new Error(`Events API error: ${eventsResponse.status} - ${errorText}`);
      }

      const eventsData = await eventsResponse.json() as CalendarEventsResponse;

      console.log(`Found ${eventsData.items?.length || 0} events for calendar: ${calendarId}`);
      console.log("Event Data", eventsData);

      // Filter out cancelled events and process the data
      const activeEvents = eventsData.items
        ?.filter(event => event.status !== "cancelled")
        .map(event => ({
          id: event.id,
          summary: event.summary || "(No title)",
          description: event.description,
          location: event.location,
          start: event.start,
          end: event.end,
          status: event.status,
          transparency: event.transparency || "opaque", // opaque means busy, transparent means free
          visibility: event.visibility || "default",
          creator: event.creator,
          organizer: event.organizer,
          attendees: event.attendees,
          recurringEventId: event.recurringEventId,
          hangoutLink: event.hangoutLink,
          htmlLink: event.htmlLink,
        })) || [];

      console.log("Active events", activeEvents);
      return {
        success: true,
        data: {
          calendarId,
          calendarSummary: eventsData.summary,
          timeZone: eventsData.timeZone,
          events: activeEvents,
          totalCount: activeEvents.length,
          nextPageToken: eventsData.nextPageToken,
        }
      };

    } catch (error) {
      console.log(`[getCalendarEvents] Error for calendar ${calendarId}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  }
});

// Enhanced getCalendarEvents with structured availability data
export const getCalendarEventsWithAvailability = action({
  args: {
    userId: v.id("users"),
    calendarId: v.string(),
    timeMin: v.optional(v.string()), // RFC3339 format (e.g., "2024-01-01T00:00:00Z")
    timeMax: v.optional(v.string()), // RFC3339 format
    maxResults: v.optional(v.number()), // Default 250, max 2500
    singleEvents: v.optional(v.boolean()), // Expand recurring events
    timezone: v.optional(v.string()), // User's timezone for availability calculations
  },
  handler: async (ctx, { userId, calendarId, timeMin, timeMax, maxResults = 250, singleEvents = true, timezone }) => {
    try {
      console.log(`Getting events for calendar: ${calendarId} from ${timeMin} to ${timeMax}`);

      // Get the token by user
      const tokenRow = await ctx.runQuery(internal.calendar.getTokenById, { userId });
      if (!tokenRow) throw new Error("The token received is invalid");

      // Check if token is expired and refresh if needed
      const isExpired = Date.now() + 30_000 >= tokenRow.expiresAtMs;
      let accessToken;

      if (isExpired) {
        console.log("Token is expired, refreshing...");
        const refreshResult = await ctx.runAction(internal.utils.tokens.refreshToken, { tokenId: tokenRow._id });

        if (!refreshResult.success || !refreshResult.accessToken) {
          throw new Error(`Token refresh failed: ${refreshResult.error}`);
        }
        accessToken = refreshResult.accessToken;
      } else {
        accessToken = tokenRow.accessToken;
      }

      // Build query parameters
      const params = new URLSearchParams({
        maxResults: maxResults.toString(),
        singleEvents: singleEvents.toString(),
        orderBy: "startTime",
      });

      if (timeMin) params.append("timeMin", timeMin);
      if (timeMax) params.append("timeMax", timeMax);

      // Fetch events from Google Calendar API
      const eventsResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!eventsResponse.ok) {
        const errorText = await eventsResponse.text();
        throw new Error(`Events API error: ${eventsResponse.status} - ${errorText}`);
      }

      const eventsData = await eventsResponse.json() as CalendarEventsResponse;

      console.log(`Found ${eventsData.items?.length || 0} events for calendar: ${calendarId}`);

      // Filter out cancelled events and process the data
      const activeEvents = eventsData.items
        ?.filter(event => event.status !== "cancelled")
        .map(event => ({
          id: event.id,
          summary: event.summary || "(No title)",
          description: event.description,
          location: event.location,
          start: event.start,
          end: event.end,
          status: event.status,
          transparency: event.transparency || "opaque", // opaque means busy, transparent means free
          visibility: event.visibility || "default",
          creator: event.creator,
          organizer: event.organizer,
          attendees: event.attendees,
          recurringEventId: event.recurringEventId,
          hangoutLink: event.hangoutLink,
          htmlLink: event.htmlLink,
        })) || [];

      // Process events into structured availability data
      const busyPeriods = activeEvents
        .filter(event => event.transparency === "opaque") // Only count opaque events as busy
        .map(event => {
          // Handle both date-time and date-only events
          const startTime = event.start?.dateTime || event.start?.date;
          const endTime = event.end?.dateTime || event.end?.date;

          if (!startTime || !endTime) return null;

          // For all-day events, convert to full day time blocks
          let processedStart: string;
          let processedEnd: string;

          if (event.start?.date && !event.start?.dateTime) {
            // All-day event - convert to 00:00-23:59 in user's timezone
            const date = new Date(event.start.date);
            processedStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0).toISOString();
            processedEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString();
          } else {
            processedStart = startTime;
            processedEnd = endTime;
          }

          return {
            eventId: event.id,
            summary: event.summary,
            start: processedStart,
            end: processedEnd,
            isAllDay: !event.start?.dateTime,
            location: event.location,
          };
        })
        .filter(period => period !== null);

      // Sort busy periods by start time
      busyPeriods.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      // Calculate free time slots between busy periods
      const freeSlots = [];
      const queryStart = timeMin ? new Date(timeMin) : new Date();
      const queryEnd = timeMax ? new Date(timeMax) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

      // Add free slot before first event
      if (busyPeriods.length > 0) {
        const firstEventStart = new Date(busyPeriods[0].start);
        if (queryStart < firstEventStart) {
          freeSlots.push({
            start: queryStart.toISOString(),
            end: firstEventStart.toISOString(),
            durationMinutes: (firstEventStart.getTime() - queryStart.getTime()) / (1000 * 60),
          });
        }
      } else {
        // No events in range - entire period is free
        freeSlots.push({
          start: queryStart.toISOString(),
          end: queryEnd.toISOString(),
          durationMinutes: (queryEnd.getTime() - queryStart.getTime()) / (1000 * 60),
        });
      }

      // Add free slots between events
      for (let i = 0; i < busyPeriods.length - 1; i++) {
        const currentEventEnd = new Date(busyPeriods[i].end);
        const nextEventStart = new Date(busyPeriods[i + 1].start);

        if (currentEventEnd < nextEventStart) {
          const durationMinutes = (nextEventStart.getTime() - currentEventEnd.getTime()) / (1000 * 60);
          // Only include gaps of at least 15 minutes
          if (durationMinutes >= 15) {
            freeSlots.push({
              start: currentEventEnd.toISOString(),
              end: nextEventStart.toISOString(),
              durationMinutes,
            });
          }
        }
      }

      // Add free slot after last event
      if (busyPeriods.length > 0) {
        const lastEventEnd = new Date(busyPeriods[busyPeriods.length - 1].end);
        if (lastEventEnd < queryEnd) {
          freeSlots.push({
            start: lastEventEnd.toISOString(),
            end: queryEnd.toISOString(),
            durationMinutes: (queryEnd.getTime() - lastEventEnd.getTime()) / (1000 * 60),
          });
        }
      }

      // Filter free slots to business hours if timezone is provided
      let businessHoursFreeSlots: Array<{
        start: string;
        end: string;
        durationMinutes: number;
        isBusinessHours?: boolean;
      }> = freeSlots;

      if (timezone) {
        businessHoursFreeSlots = freeSlots.map(slot => {
          // This is a simplified business hours filter (9 AM - 5 PM)
          // You might want to make this configurable per user
          const startDate = new Date(slot.start);
          const endDate = new Date(slot.end);

          // Convert to user's timezone for business hours calculation
          // This is simplified - you'd want proper timezone handling here
          const startHour = startDate.getHours();
          const endHour = endDate.getHours();

          // Check if slot overlaps with business hours (9-17)
          const businessStart = 9;
          const businessEnd = 17;

          if (endHour <= businessStart || startHour >= businessEnd) {
            return null; // Outside business hours
          }

          // Trim slot to business hours if needed
          const trimmedStart = startHour < businessStart ?
            new Date(startDate.setHours(businessStart, 0, 0, 0)) : startDate;
          const trimmedEnd = endHour > businessEnd ?
            new Date(endDate.setHours(businessEnd, 0, 0, 0)) : endDate;

          return {
            ...slot,
            start: trimmedStart.toISOString(),
            end: trimmedEnd.toISOString(),
            durationMinutes: (trimmedEnd.getTime() - trimmedStart.getTime()) / (1000 * 60),
            isBusinessHours: true,
          };
        }).filter((slot): slot is NonNullable<typeof slot> => slot !== null && slot.durationMinutes >= 15);
      }

      return {
        success: true,
        data: {
          calendarId,
          calendarSummary: eventsData.summary,
          timeZone: eventsData.timeZone,
          queryRange: {
            start: timeMin || queryStart.toISOString(),
            end: timeMax || queryEnd.toISOString(),
          },
          events: activeEvents,
          busyPeriods,
          freeSlots: timezone ? businessHoursFreeSlots : freeSlots,
          availability: {
            totalEvents: activeEvents.length,
            totalBusyPeriods: busyPeriods.length,
            totalFreeSlots: (timezone ? businessHoursFreeSlots : freeSlots).length,
            longestFreeSlot: Math.max(...(timezone ? businessHoursFreeSlots : freeSlots).map(slot => slot.durationMinutes), 0),
          },
          nextPageToken: eventsData.nextPageToken,
        }
      };

    } catch (error) {
      console.log(`[getCalendarEventsWithAvailability] Error for calendar ${calendarId}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  }
});

// Define types for the return data
interface BusyPeriod {
  eventId: string;
  summary: string;
  start: string;
  end: string;
  isAllDay: boolean;
  location?: string;
}

interface ConflictInfo {
  summary: string;
  start: string;
  end: string;
}

interface AlternativeSlot {
  start: string;
  end: string;
  durationMinutes: number;
}

interface AvailabilityCheckResult {
  isAvailable: boolean;
  requestedSlot: {
    start: string;
    end: string;
    durationMinutes: number;
  };
  conflicts: ConflictInfo[];
  alternativeSlots: AlternativeSlot[];
  calendarSummary: string;
}

// Helper function to check if a specific time slot is available
export const checkTimeSlotAvailability = action({
  args: {
    userId: v.id("users"),
    calendarId: v.string(),
    requestedStart: v.string(), // ISO string
    requestedEnd: v.string(), // ISO string
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, { userId, calendarId, requestedStart, requestedEnd, timezone }): Promise<{
    success: boolean;
    data?: AvailabilityCheckResult;
    error?: string;
  }> => {
    try {
      const start = new Date(requestedStart);
      const end = new Date(requestedEnd);

      // Get events for the day (expand range slightly to catch overlapping events)
      const dayStart = new Date(start);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(end);
      dayEnd.setHours(23, 59, 59, 999);

      const calendarData = await ctx.runAction(api.calendar.getCalendarEventsWithAvailability, {
        userId,
        calendarId,
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        timezone,
      });

      if (!calendarData.success || !calendarData.data) {
        throw new Error("Failed to fetch calendar data");
      }

      // Check for conflicts
      const conflicts: ConflictInfo[] = calendarData.data.busyPeriods.filter((busy: BusyPeriod) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);

        // Check if there's any overlap
        return !(end <= busyStart || start >= busyEnd);
      }).map((conflict: BusyPeriod) => ({
        summary: conflict.summary,
        start: conflict.start,
        end: conflict.end,
      }));

      const isAvailable: boolean = conflicts.length === 0;

      // Find the best free slot that could accommodate this request
      const requestedDuration = (end.getTime() - start.getTime()) / (1000 * 60);
      const alternativeSlots: AlternativeSlot[] = calendarData.data.freeSlots
        .filter((slot: { durationMinutes: number }) => slot.durationMinutes >= requestedDuration)
        .slice(0, 3) // Top 3 alternatives
        .map((slot: { start: string; durationMinutes: number }) => ({
          start: slot.start,
          end: new Date(new Date(slot.start).getTime() + requestedDuration * 60 * 1000).toISOString(),
          durationMinutes: requestedDuration,
        }));

      return {
        success: true,
        data: {
          isAvailable,
          requestedSlot: {
            start: requestedStart,
            end: requestedEnd,
            durationMinutes: requestedDuration,
          },
          conflicts,
          alternativeSlots,
          calendarSummary: `${conflicts.length === 0 ? 'Available' : 'Conflict'} - ${conflicts.length} conflicts found`,
        }
      };

    } catch (error) {
      console.error("[checkTimeSlotAvailability] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
});