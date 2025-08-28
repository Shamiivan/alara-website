# Integration Layer Error Handling

## When to Use Try-Catch in Integration Functions

Use try-catch blocks in integration layer functions to **add context and transform low-level errors into meaningful messages** before re-throwing them. External APIs often return cryptic errors like "400 Bad Request" or network timeouts that don't tell you what actually went wrong in your business context. By wrapping API calls in try-catch, you can capture these generic errors and re-throw them with specific context like "Failed to initiate ElevenLabs call to +1234567890 for user john@example.com" along with the original error details. This makes debugging much faster because when something breaks at 3am, the error message immediately tells you which integration failed, what operation was attempted, and with what data - rather than forcing you to dig through logs to piece together what happened.

## Error Flow Pattern

```typescript
// Integration layer - adds context, then throws
export async function initiateCall(client, request) {
  try {
    return await client.conversationalAi.twilio.outboundCall(request);
  } catch (error) {
    throw new Error(`ElevenLabs call failed for ${request.toNumber}: ${error.message}`);
  }
}

// Action layer - catches and decides what to do
export const makeCall = action({
  handler: async (ctx, args) => {
    try {
      const result = await initiateCall(client, request);
      return { success: true, callId: result.callSid };
    } catch (error) {
      await logError(ctx, error, { userId: args.userId });
      return { success: false, message: "Call failed, please try again" };
    }
  }
});
```

## Key Principles

1. **Integration layer**: Catch to add context, then re-throw
2. **Action layer**: Catch to make business decisions (log, cleanup, user response)
3. **Always preserve original error** using `error.cause` or similar
4. **Include relevant context** in error messages (phone numbers, user IDs, etc.)
5. **Don't swallow errors** - every error should either be handled meaningfully or re-thrown