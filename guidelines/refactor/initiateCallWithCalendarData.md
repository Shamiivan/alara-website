# Refactoring Reference for `initiateCallWithCalendarData()`

This document provides a comprehensive reference for refactoring the `initiateCallWithCalendarData()` function in `convex/calls_node.ts` according to the architecture principles. It includes all the relevant code with line numbers for reference.

## Current `initiateCallWithCalendarData()` Implementation

**File: `convex/calls_node.ts` (Lines 507-653)**

```typescript
export const initiateCallWithCalendarData = action({
  args: {
    userId: v.id("users"),
    toNumber: v.string(),
    calendarId: v.string(),
    userName: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<InitiateCallResult> => {
    try {
      // Environment variables validation
      const agentId = process.env.ELEVEN_LABS_AGENT_ID!;
      if (!agentId) throw new Error("Missing ELEVEN_LABS_AGENT_ID environment variable");

      const agentPhoneNumberId = process.env.ELEVEN_LABS_PHONE_NUMBER_ID!;
      if (!agentPhoneNumberId) throw new Error("Missing ELEVEN_LABS_PHONE_NUMBER_ID environment variable");

      const apiKey = process.env.ELEVEN_LABS_API_KEY!;
      if (!apiKey) throw new Error("Missing ELEVEN_LABS_API_KEY environment variable");

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch calendar data for today
      const calendarData = await ctx.runAction(api.calendar.getCalendarEventsWithAvailability, {
        userId: args.userId,
        calendarId: args.calendarId,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        timezone: args.timezone || "America/Toronto",
      });

      if (!calendarData.success || !calendarData.data) {
        throw new Error("Failed to fetch calendar data");
      }

      // Extract today's free and busy slots
      const todayFreeSlots = calendarData.data.freeSlots.map(slot => ({
        start: slot.start,
        end: slot.end,
        durationMinutes: slot.durationMinutes,
        isBusinessHours: slot.isBusinessHours || false,
      }));

      const todayBusySlots = calendarData.data.busyPeriods.map(busy => ({
        summary: busy.summary,
        start: busy.start,
        end: busy.end,
        isAllDay: busy.isAllDay,
        location: busy.location || null,
      }));

      // Initialize ElevenLabs client
      const elevenLabs = new ElevenLabsClient({
        apiKey: apiKey
      });

      // Build dynamic variables with calendar data
      const dynamicVariables: Record<string, string> = {
        user_name: args.userName || "There",
        user_timezone: args.timezone || "America/Toronto",
        calendar_connected: "true",
        today_free_slots: JSON.stringify(todayFreeSlots),
        today_busy_slots: JSON.stringify(todayBusySlots),
        total_free_slots: todayFreeSlots.length.toString(),
        total_busy_periods: todayBusySlots.length.toString(),
        longest_free_slot: Math.max(...todayFreeSlots.map(slot => slot.durationMinutes), 0).toString(),
      };

      // Log calendar data for debugging
      console.log(`Calendar data for call initiation:`, {
        freeSlots: todayFreeSlots.length,
        busySlots: todayBusySlots.length,
        userId: args.userId,
        calendarId: args.calendarId,
      });

      // Make API call to ElevenLabs to initiate the call
      const result = await elevenLabs.conversationalAi.twilio.outboundCall({
        agentId: agentId,
        agentPhoneNumberId: agentPhoneNumberId,
        toNumber: args.toNumber,
        conversationInitiationClientData: {
          dynamicVariables: dynamicVariables,
        }
      });

      if (!result.callSid) throw new Error("Failed to get callSid from ElevenLabs");

      // Create a call record in the database
      const dbCallId: Id<"calls"> = await ctx.runMutation(api.calls.createCall, {
        userId: args.userId,
        toNumber: args.toNumber,
        agentId: agentId,
        agentPhoneNumberId: agentPhoneNumberId,
        elevenLabsCallId: result.callSid,
        status: "initiated"
      });

      // Update the call with ElevenLabs response data
      await ctx.runMutation(api.calls.updateCallWithElevenLabsResponse, {
        callId: dbCallId,
        elevenLabsCallId: result.callSid,
        conversationId: result.conversationId || "",
        twilioCallSid: result.callSid,
        success: true
      });

      // Return success response with call details and calendar summary
      return {
        success: true,
        callId: dbCallId,
        elevenLabsCallId: result.callSid,
        conversationId: result.conversationId || "",
        message: `Call initiated successfully with calendar data - ${todayFreeSlots.length} free slots, ${todayBusySlots.length} busy periods`,
      };

    } catch (error) {
      // Log error
      await ctx.runMutation(api.events.logErrorInternal, {
        category: "calls",
        message: `Failed to initiate ElevenLabs call with calendar data: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          toNumber: args.toNumber,
          calendarId: args.calendarId,
          error: error instanceof Error ? error.stack : String(error),
        },
        source: "convex",
      });

      console.log("Error in initiateCallWithCalendarData:", error);

      // Return error response
      return {
        success: false,
        callId: "" as Id<"calls">,
        elevenLabsCallId: "",
        conversationId: "",
        message: error instanceof Error ? error.message : String(error)
      };
    }
  },
});
```

## Related Functions in Core and Integration Layers

### 1. ElevenLabs Integration Function

**File: `convex/integrations/elevenlabs/calls.ts` (Lines 14-42)**

```typescript
export async function initiateCall(request: CallRequest): Promise<Result<CallResult>> {
  try {
    const client = createClient();

    const result = await client.conversationalAi.twilio.outboundCall({
      agentId: request.agentId,
      agentPhoneNumberId: request.agentPhoneNumberId,
      toNumber: request.toNumber,
      conversationInitiationClientData: {
        dynamicVariables: request.dynamicVariables
      }
    });

    if (!result.callSid) {
      throw new Error("ElevenLabs returned no callSid");
    }

    return Ok(
      {
        callSid: result.callSid,
        conversationId: result.conversationId,
      }
    )

  } catch (error) {
    throw new Error(`ElevenLabs call failed for ${request.toNumber}: ${error}`);
  }
}
```

### 2. Calendar Integration Functions

**File: `convex/integrations/google/calendar.ts` (Lines 26-68)**

```typescript
export async function fetchCalendarEvents(
  accessToken: string,
  calendarId: string,
  options: CalendarEventsOptions = {}
): Promise<CalendarEventsResponse> {
  try {
    const {
      timeMin,
      timeMax,
      maxResults = 250,
      singleEvents = true,
    } = options;

    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      singleEvents: singleEvents.toString(),
      orderBy: "startTime",
    });

    if (timeMin) params.append("timeMin", timeMin);
    if (timeMax) params.append("timeMax", timeMax);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Calendar Events API error: ${response.status} - ${errorText}`);
    }

    return await response.json() as CalendarEventsResponse;
  } catch (error) {
    throw new Error(`Failed to fetch calendar events for ${calendarId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

### 3. Core Calendars Actions

**File: `convex/core/calendars/actions.ts` (Lines 97-140, 143-219)**

```typescript
// First function: getCalendarEvents
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
      console.log(`Getting events for calendar: ${calendarId}`);

      const accessToken = await ctx.runAction(internal.core.tokens.ensureValidToken, { userId });

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
      return Err(error instanceof Error ? error.message : "Failed to get calendar events");
    }
  }
});

// Second function: getAvailability
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
```

### 5. Core Calls Mutations

**File: `convex/core/calls/mutations.ts` (Lines 34-70)**

```typescript
export const createCallRecord = mutation({
  args: {
    userId: v.id("users"),
    toNumber: v.string(),
    purpose: v.optional(v.string()),
    agentId: v.optional(v.string()),
    agentPhoneNumberId: v.optional(v.string()),
    conversationId: v.optional(v.string()), // if preallocated on provider
    elevenLabsCallId: v.optional(v.string()), // if already known
    twilioCallSid: v.optional(v.string()),
    startTimeUnix: v.optional(v.number()), // provider start unix (secs) if available
  },
  handler: async (ctx, args) => {
    const doc = {
      userId: args.userId,
      toNumber: args.toNumber,
      purpose: args.purpose,
      status: "initiated" as const,
      elevenLabsCallId: args.elevenLabsCallId,
      agentId: args.agentId,
      agentPhoneNumberId: args.agentPhoneNumberId,
      conversationId: args.conversationId,
      twilioCallSid: args.twilioCallSid,
      hasTranscript: false,
      hasAudio: false,
      startTimeUnix: args.startTimeUnix,
      initiatedAt: Date.now(),
      // unset fields
      duration: undefined,
      cost: undefined,
      completedAt: undefined,
      errorMessage: undefined,
    };
    const callId = await ctx.db.insert("calls", doc);
    return callId;
  },
});
```

### 6. Core Calls Actions

**File: `convex/core/calls/actions.ts` (Lines 17-102)**

```typescript
export const initiateReminderCall = action({
  args: {
    userId: v.id("users"),
    toNumber: v.string(),
    userName: v.optional(v.string()),
    taskName: v.optional(v.string()),
    taskTime: v.optional(v.string()),
    timezone: v.optional(v.string()),
    taskID: v.id("tasks")
  },
  returns: v.union(
    v.object({
      success: v.literal(true), data: v.object({
        callId: v.id("calls"),
        elevenLabsCallId: v.string(),
        conversationId: v.string()
      })
    }),
    v.object({ success: v.literal(false), error: v.string() })
  ),
  handler: async (ctx, args): Promise<Result<ReminderCallData>> => {
    try {
      // Validate task exists
      const task = await ctx.runQuery(api.tasks.getTaskById, { taskId: args.taskID });
      if (!task) {
        return Err(`Task with ID ${args.taskID} not found`);
      }

      // Get environment configuration
      const config = getReminderCallConfig();
      if (!config.success) {
        return Err(config.error);
      }

      // Prepare call request
      const callRequest = {
        agentId: config.data.agentId,
        agentPhoneNumberId: config.data.agentPhoneNumberId,
        toNumber: args.toNumber,
        dynamicVariables: {
          user_name: args.userName || "There",
          user_timezone: args.timezone || "America/Toronto",
          task_name: args.taskName!,
          task_time: args.taskTime!,
        }
      };

      // Make the call through integration layer
      const callResult = await callElevenLabs(callRequest);
      if (!callResult.success) {
        await logCallError(ctx, args.toNumber, callResult.error);
        return Err("Failed to initiate reminder call");
      }

      // Validate required fields from ElevenLabs response
      if (!callResult.data.callId) {
        return Err("ElevenLabs did not return a call ID");
      }

      const elevenLabsCallId = callResult.data.callId;
      const conversationId = callResult.data.conversationId!;

      // Create call record using the proper mutation
      const dbCallId = await ctx.runMutation(api.core.calls.mutations.createCallRecord, {
        userId: args.userId,
        toNumber: args.toNumber,
        purpose: "reminder",
        agentId: config.data.agentId,
        agentPhoneNumberId: config.data.agentPhoneNumberId,
        elevenLabsCallId: elevenLabsCallId,
        conversationId: conversationId,
        twilioCallSid: elevenLabsCallId,
      });

      return Ok({
        callId: dbCallId,
        elevenLabsCallId: elevenLabsCallId,
        conversationId: conversationId
      });

    } catch (error) {
      await logCallError(ctx, args.toNumber, error instanceof Error ? error.message : String(error));
      return Err("An unexpected error occurred while initiating the reminder call");
    }
  },
});
```

## Result<T> Pattern Implementation

**File: `convex/shared/result.ts` (Lines 1-11)**

```typescript
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function Ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function Err<T>(error: string): Result<T> {
  return { success: false, error };
}
```

## Key Architectural Issues with Current `initiateCallWithCalendarData()`

1. **Direct API Integration**: The function directly creates and uses the ElevenLabsClient instead of using the integration layer function `initiateCall` from `convex/integrations/elevenlabs/calls.ts`.

2. **Environment Configuration Mixed with Logic**: The function directly accesses and validates environment variables within the function body, rather than using a dedicated helper function.

3. **Inconsistent Error Handling**: The function uses a mix of throwing errors and returning error objects, rather than consistently using the Result<T> pattern.

4. **Missing Explicit Return Type Validator**: There is no validator for the return type that follows the Result<T> pattern.

5. **No Separation of Concerns**: The function mixes calendar data fetching, API integration, and database operations without clear separation.

6. **Direct Database Access**: The function calls `api.calls.createCall` instead of using core layer mutations like `api.core.calls.mutations.createCallRecord`.

7. **Incomplete Type Definitions**: The return type uses `InitiateCallResult` interface which doesn't properly reflect the Result<T> pattern.

8. **Error Logging Mixed with Logic**: The function directly handles error logging rather than using a helper function.

9. **Calendar Integration Not Properly Layered**: The function directly calls `api.calendar.getCalendarEventsWithAvailability` instead of using the proper core layer functions `api.core.calendars.actions.getCalendarEvents` and `api.core.calendars.actions.getAvailability`.

## Refactoring Requirements

1. **Define Appropriate Types**:
   - Create a dedicated interface for the calendar call data
   - Use proper Result<T> pattern for return types

2. **Extract Environment Configuration**:
   - Create a helper function for getting and validating environment variables

3. **Use Integration Layer**:
   - Replace direct ElevenLabsClient usage with calls to the integration layer function

4. **Implement Proper Error Handling**:
   - Use the Result<T> pattern consistently
   - Return Ok(data) for success cases
   - Return Err(message) for error cases
   - Never throw errors to the frontend

5. **Use Core Calendar Layer**:
   - Replace calls to `api.calendar.getCalendarEventsWithAvailability` with sequential calls to `api.core.calendars.actions.getCalendarEvents` and `api.core.calendars.actions.getAvailability`
   - Use the proper Result<T> pattern when handling the results from these functions

6. **Use Core Layer Mutations**:
   - Replace calls to `api.calls.createCall` with `api.core.calls.mutations.createCallRecord`

7. **Add Return Type Validator**:
   - Include a validator for the Result<T> pattern using v.union()

8. **Extract Error Logging**:
   - Create a helper function for error logging

9. **Improve Parameter Validation**:
   - Validate inputs early in the function
   - Use default values appropriately