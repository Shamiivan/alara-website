# Error Handling Guidelines

## Rules

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

// ❌ Bad - no context
export async function makeCall(client, request) {
  return await client.call(request); // Throws cryptic "400 Bad Request"
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

// ❌ Bad - can crash frontend
export const initiateCall = action({
  handler: async (ctx, args) => {
    return await makeCall(client, args); // Throws to frontend
  }
});
```

### React Components
- **ALWAYS** check `result.success` before using data
- **ALWAYS** show user feedback (toast, alert, etc.)
- **NEVER** use try-catch around Convex calls

```typescript
// ✅ Good
function CallButton({ phone }) {
  const initiateCall = useAction(api.calls.initiateCall);
  
  const handleCall = async () => {
    const result = await initiateCall({ phone });
    
    if (result.success) {
      toast.success("Call started");
      // Use result.data safely
    } else {
      toast.error(result.error);
    }
  };
  
  return <button onClick={handleCall}>Call</button>;
}

// ❌ Bad - no error handling
function CallButton({ phone }) {
  const initiateCall = useAction(api.calls.initiateCall);
  
  const handleCall = async () => {
    const result = await initiateCall({ phone });
    toast.success(`Call started: ${result.data}`); // Crashes if error
  };
  
  return <button onClick={handleCall}>Call</button>;
}
```

## Required Types

```typescript
// Add this to your project
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

## Error Message Rules

- **User messages**: Simple, blame-free, actionable ("Try again", "Check connection")
- **Dev messages**: Specific context (phone numbers, user IDs, API endpoints)
- **Never expose**: Internal errors, stack traces, but log them please