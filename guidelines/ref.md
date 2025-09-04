# Refactoring Reference for `initiateReminderCall()`

This document provides a comprehensive reference for refactoring the `initiateReminderCall()` function in `convex/calls_node.ts` according to the architecture principles. It includes all the relevant code with line numbers for reference.

## Current `initiateReminderCall()` Implementation

**File: `convex/calls_node.ts` (Lines 251-358)**

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
  handler: async (ctx, args) => {
    try {
      const id = args.taskID;
      // get the task 
      // const task = args.taskID ? await ctx.runQuery(api.tasks.getTaskById, { taskId: args.taskID }) : null;
      const task = await ctx.runQuery(api.tasks.getTaskById, { taskId: id });

      if (!task) throw new Error(`Task with ID ${args.taskID} not found`);

      const agentId = process.env.ELEVEN_LABS_REMINDER_AGENT_ID!;
      console.error("Please set the ELEVEN_LABS_PHONE_NUMBER_ID environment variable")
      const agentPhoneNumberId = process.env.ELEVEN_LABS_PHONE_NUMBER_ID!;

      const apiKey = process.env.ELEVEN_LABS_API_KEY!;

      const elevenLabs = new ElevenLabsClient({
        apiKey: apiKey
      });

      // build the arguments (username and )
      const dynamicVariables: Record<string, string> = {
        user_name: args.userName || "",
        user_timezone: args.timezone || "America/Toronto",
        task_name: args.taskName || "",
        task_time: args.taskTime || "",
      }
      // Make API call to ElevenLabs to initiate the call
      const result = await elevenLabs.conversationalAi.twilio.outboundCall({
        agentId: agentId,
        agentPhoneNumberId: agentPhoneNumberId,
        toNumber: args.toNumber,
        conversationInitiationClientData: {
          dynamicVariables: dynamicVariables,
        }
      });

      if (!result.callSid) {
        throw new Error("Failed to get callSid from ElevenLabs");
      }

      // Create a call record in the database
      const dbCallId = await ctx.runMutation(api.calls.createCall, {
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
        purpose: "reminder",
        elevenLabsCallId: result.callSid,
        conversationId: result.conversationId || "",
        twilioCallSid: result.callSid,
        success: true
      });

    } catch (error) {
      // Log error
      await ctx.runMutation(api.events.logErrorInternal, {
        category: "calls",
        message: `Failed to initiate ElevenLabs call: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          toNumber: args.toNumber,
          error: error instanceof Error ? error.stack : String(error),
        },
        source: "convex",
      });

      // Log the error for debugging
      console.log("Error in initiateCall:", error);

      // We don't need to update call status here since we don't have a callId
      // if there was an error before creating the call

      throw error;
    }
  },
});
```

## Related Functions in `convex/calls_node.ts`

### `initiateCall` (Lines 24-117)

```typescript
export const initiateCall = action({
  args: {
    userId: v.id("users"),
    toNumber: v.string(),
    userName: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<InitiateCallResult> => {
    try {
      const agentId = process.env.ELEVEN_LABS_AGENT_ID!;
      if (!agentId) throw new Error("Missing ELEVEN_LABS_AGENT_ID environment variable");

      const agentPhoneNumberId = process.env.ELEVEN_LABS_PHONE_NUMBER_ID!;
      if (!agentId) throw new Error("Missing ELEVEN_LABS_PHONE_NUMBER_ID environment variable");
      const apiKey = process.env.ELEVEN_LABS_API_KEY!;
      if (!apiKey) throw new Error("Missing ELEVEN_LABS_API_KEY environment variable");

      const elevenLabs = new ElevenLabsClient({
        apiKey: apiKey
      });

      // build the arguments (username and )
      const dynamicVariables: Record<string, string> = {
        user_name: args.userName || "There",
        user_timezone: args.timezone || "America/Toronto",
      }
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

      // Return success response with call details
      return {
        success: true,
        callId: dbCallId,
        elevenLabsCallId: result.callSid,
        conversationId: result.conversationId || "",
        message: "Call initiated successfully"
      };
    } catch (error) {
      // Log error
      await ctx.runMutation(api.events.logErrorInternal, {
        category: "calls",
        message: `Failed to initiate ElevenLabs call: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          toNumber: args.toNumber,
          error: error instanceof Error ? error.stack : String(error),
        },
        source: "convex",
      });

      // Log the error for debugging
      console.log("Error in initiateCall:", error);

      // We don't need to update call status here since we don't have a callId
      // if there was an error before creating the call

      // Return error response with proper typing
      return {
        success: false,
        callId: "" as Id<"calls">, // Empty ID as placeholder
        elevenLabsCallId: "",
        conversationId: "",
        message: error instanceof Error ? error.message : String(error)
      };
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

## Core/Calls Architecture

### Types

**File: `convex/core/calls/types.ts` (Lines 1-14)**

```typescript
import { Id } from "../../_generated/dataModel";
// Types for return values
export interface FetchConversationResult {
  success: boolean;
  message?: string;
}

// Return data for successful call initiation
export interface CallInitiationData {
  success: boolean;
  callId: Id<"calls">;
  elevenLabsCallId: string;
  conversationId: string;
}
```

### Mutations

**File: `convex/core/calls/mutations.ts`**

Key patterns:
- Well-defined validators for input args
- Clear type definitions and interfaces
- Proper error handling

Example function (Lines 35-70):

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

### Queries

**File: `convex/core/calls/queries.ts` (Lines 1-18)**

```typescript
import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getCallById = query({
  args: { callId: v.id("calls") },
  handler: async (ctx, { callId }) => ctx.db.get(callId),
});

// Fetch a call by ElevenLabs call id (webhook join)
export const getCallByElevenLabsId = query({
  args: { elevenLabsCallId: v.string() },
  handler: async (ctx, { elevenLabsCallId }) => {
    return await ctx.db
      .query("calls")
      .withIndex("by_eleven_labs_call_id", q => q.eq("elevenLabsCallId", elevenLabsCallId))
      .unique();
  },
});
```

## Integration Layer Pattern

**File: `convex/integrations/elevenlabs/calls.ts` (Lines 1-42)**

```typescript
"use node"
// any functions responsible for making outbout calls
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { CallResult, CallRequest } from "./types";
import { error } from "console";
import { Ok, Result } from "../../shared/result";

function createClient(): ElevenLabsClient {
  const apiKey = process.env.ELEVEN_LABS_API_KEY!;
  if (!apiKey) throw new Error("Missing ELEVEN_LABS_API_KEY environment variable");
  return new ElevenLabsClient({ apiKey: apiKey });
}

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

**File: `convex/integrations/elevenlabs/types.ts` (Lines 1-20)**

```typescript
export interface CallResult {
  callId?: string;
  conversationId?: string;
}



export interface CallRequest {
  agentId: string;
  agentPhoneNumberId: string;
  toNumber: string;
  dynamicVariables: Record<string, string | number | boolean>;
}
```

## Error Handling Patterns

**File: `guidelines/ErrorHandling.md`**

Key principles:

### Integration Functions
- **ALWAYS** wrap external API calls in try-catch
- **ALWAYS** add context to error message before re-throwing
- **NEVER** return Result<T> from integration functions

```typescript
// ✅ Good
export async function makeCall(client, request) {
  try {
    return await client.call(request);
  } catch (error) {
    throw new Error(`Call failed for ${request.phone}: ${error.message}`);
  }
}
```

### Convex Actions
- **ALWAYS** return Result<T>, never throw to frontend
- **ALWAYS** catch all errors and convert to user-friendly messages
- **ALWAYS** use the same return validator pattern

```typescript
// ✅ Good
export const initiateCall = action({
  args: { phone: v.string() },
  returns: v.union(
    v.object({ success: v.literal(true), data: v.string() }),
    v.object({ success: v.literal(false), error: v.string() })
  ),
  handler: async (ctx, args) => {
    try {
      const result = await makeCall(client, args);
      return { success: true, data: result.callId };
    } catch (error) {
      return { success: false, error: "Call failed, please try again" };
    }
  }
});
```

## Key Architectural Issues with Current `initiateReminderCall()`

1. **No Explicit Return Type**: The function doesn't declare a return type, unlike other similar functions that use `Promise<InitiateCallResult>`.

2. **Missing Returns Validator**: There's no validator for the return value, which should use the Result<T> pattern.

3. **Direct API Integration**: The function directly creates and uses the ElevenLabsClient instead of using integration layer functions.

4. **Inconsistent Error Handling**: It throws errors instead of returning Result<T> with error information.

5. **Environmental Configuration Mixed with Logic**: The function directly accesses environment variables.

6. **No Separation of Concerns**: The function mixes API integration, business logic, and error handling.

7. **Incomplete Type Definitions**: Several types are defined inline rather than using shared interfaces.

## Refactoring Requirements

1. **Define Return Type**: Add explicit `Promise<Result<T>>` return type.

2. **Add Returns Validator**: Include a validator for the Result<T> pattern.

3. **Extract API Integration**: Move ElevenLabsClient usage to the integration layer.

4. **Consistent Error Handling**: Use the Result<T> pattern with `Ok()` and `Err()`.

5. **Use Existing Infrastructure**: Leverage existing mutations and types.

6. **Separate Concerns**: Refactor into smaller functions with clear responsibilities.

7. **Type Definitions**: Use or create proper type interfaces.
