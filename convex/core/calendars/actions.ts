"use node";
import { v } from "convex/values";
import { action } from "./../../_generated/server";
import { api, internal } from "./../../_generated/api";
import { CalendarEventsResponse, CreateCalendarEventRequest, GoogleCalendarEvent } from "../../integrations/google/types";
import { createEvent, fetchCalendars, fetchCalendarEvents } from "../../integrations/google/calendar";
import { Result, Ok, Err } from "../../shared/result";

// Calendar item type
type CalendarItem = {
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
};

// Data types (what goes inside Result<T>)
type UserCalendarsData = {
  calendars: CalendarItem[];
  primaryCalendar: CalendarItem | null;
  totalCount: number;
};

type CalendarEventsData = {
  calendarId: string;
  events: Array<{
    id: string;
    summary: string;
    start: any;
    end: any;
    transparency: string;
  }>;
};

type AvailabilityData = {
  busyPeriods: Array<{
    start: string;
    end: string;
    summary: string;
  }>;
  freeSlots: Array<{
    start: string;
    end: string;
    durationMinutes: number;
  }>;
};

type SlotAvailabilityData = {
  isAvailable: boolean;
  conflicts: Array<{
    start: string;
    end: string;
    summary: string;
  }>;
};

export const getUserCalendars = action({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, { userId }): Promise<Result<UserCalendarsData>> => {
    try {

      // Get valid access token (handles refresh automatically)
      const accessToken = await ctx.runAction(internal.core.tokens.actions.ensureValidToken, { userId });

      // Fetch calendars using the integration function
      const calendarData = await fetchCalendars(accessToken);


      // Find the primary calendar
      const primaryCalendar = calendarData.items?.find(cal => cal.primary === true) || null;


      // Check if user needs their main calendar ID set
      if (primaryCalendar?.id) {
        const user = await ctx.runQuery(api.core.users.queries.getUserById, { userId });

        if (user && !user.mainCalendarId) {
          await ctx.runMutation(api.core.users.mutations.updateMainCalendar, {
            userId,
            mainCalendarId: primaryCalendar.id,
          });
        }
      }

      return Ok({
        calendars: calendarData.items || [],
        primaryCalendar,
        totalCount: calendarData.items?.length || 0
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log("[getUserCalendars] Error:", error);

      // Default friendly message
      return Err("We hit a small bump loading your calendar. Please try again - we're here to help if it keeps happening.");

    }
  }
});

export const getCalendarEvents = action({
  args: {
    userId: v.id("users"),
    calendarId: v.string(),
    timeMin: v.optional(v.string()),
    timeMax: v.optional(v.string()),
  },
  returns: v.union(
    v.object({ success: v.literal(true), data: v.any() }),
    v.object({ success: v.literal(false), error: v.string() })
  ),
  handler: async (ctx, { userId, calendarId, timeMin, timeMax }): Promise<Result<CalendarEventsData>> => {
    try {

      const accessToken = await ctx.runAction(internal.core.tokens.actions.ensureValidToken, { userId });

      const response: CalendarEventsResponse = await fetchCalendarEvents(accessToken, calendarId, {
        timeMin,
        timeMax,
        singleEvents: true,
      });

      const events = response.items
        ?.filter((event: GoogleCalendarEvent) => event.status !== "cancelled")
        .map((event: GoogleCalendarEvent) => ({
          id: event.id,
          summary: event.summary || "(No title)",
          start: event.start,
          end: event.end,
          transparency: event.transparency || "opaque",
        })) || [];

      return Ok({
        calendarId,
        events,
      });

    } catch (error) {
      console.log(`[getCalendarEvents] Error:`, error);
      await ctx.runMutation(api.system.telemetry.mutations.createLog, {
        userId,
        event: "calendar_fetch_failed",
        context: {
          calendarId,
          timeRange: { timeMin, timeMax }
        },
        error: error instanceof Error ? error.message : String(error)
      });
      return Err("Failed to get calendar events");
    }
  }
});

export const getAvailability = action({
  args: {
    events: v.array(v.any()),
    timeMin: v.string(),
    timeMax: v.string(),
  },
  returns: v.union(
    v.object({ success: v.literal(true), data: v.any() }),
    v.object({ success: v.literal(false), error: v.string() })
  ),
  handler: async (ctx, { events, timeMin, timeMax }): Promise<Result<AvailabilityData>> => {
    try {
      const queryStart = new Date(timeMin);
      const queryEnd = new Date(timeMax);

      // Get busy times - fix the null filtering
      const busyPeriods: Array<{ start: string; end: string; summary: string }> = events
        .filter(event => event.transparency === "opaque")
        .map(event => {
          const start = event.start?.dateTime || event.start?.date;
          const end = event.end?.dateTime || event.end?.date;
          return start && end ? { start, end, summary: event.summary } : null;
        })
        .filter((period): period is { start: string; end: string; summary: string } => period !== null)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      // Get free times
      const freeSlots: Array<{ start: string; end: string; durationMinutes: number }> = [];

      if (busyPeriods.length === 0) {
        freeSlots.push({
          start: queryStart.toISOString(),
          end: queryEnd.toISOString(),
          durationMinutes: (queryEnd.getTime() - queryStart.getTime()) / (1000 * 60),
        });
      } else {
        // Before first event
        if (queryStart < new Date(busyPeriods[0].start)) {
          freeSlots.push({
            start: queryStart.toISOString(),
            end: busyPeriods[0].start,
            durationMinutes: (new Date(busyPeriods[0].start).getTime() - queryStart.getTime()) / (1000 * 60),
          });
        }

        // Between events
        for (let i = 0; i < busyPeriods.length - 1; i++) {
          const currentEnd = new Date(busyPeriods[i].end);
          const nextStart = new Date(busyPeriods[i + 1].start);
          const gap = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);

          if (gap >= 15) {
            freeSlots.push({
              start: currentEnd.toISOString(),
              end: nextStart.toISOString(),
              durationMinutes: gap,
            });
          }
        }

        // After last event
        const lastEnd = new Date(busyPeriods[busyPeriods.length - 1].end);
        if (lastEnd < queryEnd) {
          freeSlots.push({
            start: lastEnd.toISOString(),
            end: queryEnd.toISOString(),
            durationMinutes: (queryEnd.getTime() - lastEnd.getTime()) / (1000 * 60),
          });
        }
      }

      return Ok({ busyPeriods, freeSlots });

    } catch (error) {
      console.log("[getAvailability] Error:", error);
      return Err(error instanceof Error ? error.message : "Failed to calculate availability");
    }
  }
});

export const checkSlotAvailability = action({
  args: {
    busyPeriods: v.array(v.any()),
    requestedStart: v.string(),
    requestedEnd: v.string(),
  },
  returns: v.union(
    v.object({ success: v.literal(true), data: v.any() }),
    v.object({ success: v.literal(false), error: v.string() })
  ),
  handler: async (ctx, { busyPeriods, requestedStart, requestedEnd }): Promise<Result<SlotAvailabilityData>> => {
    try {
      const start = new Date(requestedStart);
      const end = new Date(requestedEnd);

      const conflicts = busyPeriods.filter(busy => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return !(end <= busyStart || start >= busyEnd);
      });

      return Ok({
        isAvailable: conflicts.length === 0,
        conflicts,
      });

    } catch (error) {
      console.log("[checkSlotAvailability] Error:", error);
      return Err(error instanceof Error ? error.message : "Failed to check slot availability");
    }
  }
});


export const createCalendarEvent = action({
  args: {
    title: v.string(),
    startTime: v.string(), // ISO string from task.due
    duration: v.optional(v.number()), // minutes
    userId: v.id("users"),
    taskId: v.optional(v.id("tasks"))
  },
  returns: v.union(
    v.object({ success: v.literal(true), data: v.string() }),
    v.object({ success: v.literal(false), error: v.string() })
  ),
  handler: async (ctx, args): Promise<Result<string>> => {
    try {
      const duration = !args.duration ? 30 : args.duration; // default duration is 30min 
      const endTime = new Date(new Date(args.startTime).getTime() + duration * 60000).toISOString();
      const accessToken = await ctx.runAction(internal.core.tokens.actions.ensureValidToken, { userId: args.userId });
      const mainCalendarId = await ctx.runQuery(api.core.users.queries.getMainCalendarId, { userId: args.userId });
      if (!mainCalendarId) return Err("Could not get the calendar connected to this account");
      const request = {
        accessToken: accessToken,
        calendarId: mainCalendarId,
        title: args.title,
        startTime: args.startTime,
        endTime: endTime,
      } as CreateCalendarEventRequest;

      const response = await createEvent(request);
      return Ok("Calendar event succesfully created. Nice!")
    } catch (error) {
      console.log("[CreateCalendarEvent]: Error", error);
      return Err("It seems like something went wrong. Could not create a calendar Events");
    }
  }
});