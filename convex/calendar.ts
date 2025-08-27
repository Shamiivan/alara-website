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