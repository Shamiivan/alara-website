# Convex Development Guidelines

## Architecture Principles

### 1. Separation of Concerns
- **Integration Layer**: Pure functions that call external APIs
  - Located in `integrations/` directory
  - No Convex dependencies
  - Always throw errors with descriptive context
  - Example: `fetchCalendarEvents(accessToken, calendarId, options)`

- **Core Layer**: Organized business logic functions
  - Located in `core/` directory (e.g., `core/calls/`, `core/tokens/`)
  - Use proper mutations like `createCallRecord`, `markCompleted`, `markFailed`
  - Include status transition validation and type safety

- **Action Layer**: Convex functions that orchestrate workflows
  - Located in `convex/` directory
  - Call integration functions and core utilities
  - Handle database operations and token management
  - Always return `Result<T>`, never throw to frontend

### 2. Error Handling Pattern
```typescript
// Integration functions - ALWAYS throw
export async function makeCall(request: CallRequest) {
  try {
    return await client.call(request);
  } catch (error) {
    throw new Error(`Call failed for ${request.phone}: ${error.message}`);
  }
}

// Actions - ALWAYS return Result<T>
export const initiateCall = action({
  handler: async (ctx, args): Promise<Result<CallData>> => {
    try {
      const result = await makeCall(request);
      return Ok(result);
    } catch (error) {
      return Err("Call failed, please try again");
    }
  }
});
```

### 3. Type Structure
```typescript
// Define data types OUTSIDE functions
interface CallData {
  callId: Id<"calls">;
  elevenLabsCallId: string;
  conversationId: string;
}

// Use Result<T> wrapper in return type
handler: async (ctx, args): Promise<Result<CallData>> => {
  // Function returns Ok(data) or Err(message)
}
```

## Function Guidelines

### Action Patterns
- Use `"use node";` at top of files with Node.js imports
- Always include explicit Promise return types
- Use `ctx.runAction(internal.core.tokens.ensureValidToken, { userId })` for token management
- Include console.log for debugging with context
- Import `Result`, `Ok`, `Err` from `shared/result`
- Use `!` (non-null assertion) after validation instead of safe defaults

### Core Utilities
- Use established core functions like `api.core.calls.mutations.createCallRecord`
- Leverage status transition helpers: `markInProgress`, `markCompleted`, `markFailed`
- Follow file-based routing: `convex/core/calls/mutations.ts` → `api.core.calls.mutations.functionName`

### Validator Patterns
```typescript
// Keep validators simple
args: {
  userId: v.id("users"),
  data: v.array(v.any()), // Use v.any() for flexibility
}

```

### TypeScript Best Practices
- Use type guards for null filtering: `.filter((item): item is NonNullType => item !== null)`
- Add explicit array types when needed: `const items: Array<ItemType> = []`
- Define types outside functions for reusability
- Use `any` for complex API response fields to avoid over-engineering
- ALWAYS add explicit Promise return types to action handlers
- Be strict with document IDs: use `Id<"tableName">` not `string`
- Use `!` after validation instead of `|| ""` fallbacks

## Convex Core Rules
- Use `withIndex` instead of `filter` for queries - define indexes in schema
- Queries don't support `.delete()` - use `.collect()` then iterate with `ctx.db.delete(id)`
- Use `.unique()` to get single document (throws if multiple found)
- Use `ctx.runQuery`, `ctx.runMutation`, `ctx.runAction` with FunctionReference
- Default query order is ascending `_creationTime` - use `.order("desc")` to reverse
- System fields `_id` and `_creationTime` are auto-added to all documents

## Code Organization

### File Structure
```
convex/
  core/
    calls/
      actions.ts      # Public actions
      queries.ts      # Public queries  
      mutations.ts    # Public mutations with status transitions
    tokens/
      actions.ts      # Token management
integrations/
  elevenlabs/
    calls.ts          # Pure API functions
    types.ts          # API request/response types
shared/
  result.ts           # Result<T> helpers
```

### Function Naming
- Actions: `initiateCall`, `getUserCalendars`, `getCalendarEvents`
- Integration: `initiateCall`, `fetchCalendars`, `refreshAccessToken`
- Core mutations: `createCallRecord`, `markCompleted`, `markFailed`
- Clear, descriptive names that indicate the layer

## Simplification Rules

### Always Ask: "Can We Simplify?"
- Remove unused parameters and return fields
- Combine similar operations when logical
- Cut intermediate abstraction layers
- Focus on core functionality first
- Use existing core utilities instead of creating new ones

### Startup Velocity Priorities
1. **Working code** over perfect architecture
2. **Direct patterns** over complex abstractions
3. **Existing patterns** over new inventions
4. **Small iterations** over big rewrites
5. **Essential features** over comprehensive solutions

### When to Add Complexity
- When current code becomes hard to maintain
- When multiple similar functions need the same logic
- When TypeScript errors prevent development
- When business requirements clearly demand it

## Common Patterns

### Token Management
```typescript
// Always delegate to ensureValidToken
const accessToken = await ctx.runAction(internal.core.tokens.ensureValidToken, { userId });
```

### API Error Handling
```typescript
// Integration layer
if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`API error: ${response.status} - ${errorText}`);
}

// Action layer
try {
  const result = await integrationFunction();
  return Ok(result);
} catch (error) {
  console.log("[functionName] Error:", error);
  return Err(error.message);
}
```

### Configuration Helpers
```typescript
// Extract environment validation into helper functions
function getCallConfig(): Result<{agentId: string, phoneId: string}> {
  const agentId = process.env.AGENT_ID;
  const phoneId = process.env.PHONE_ID;
  
  if (!agentId) return Err("Missing AGENT_ID");
  if (!phoneId) return Err("Missing PHONE_ID");
  
  return Ok({ agentId, phoneId });
}
```

### Data Transformation
```typescript
// Keep transformations simple and focused
const events = response.items
  ?.filter(event => event.status !== "cancelled")
  .map(event => ({
    id: event.id,
    summary: event.summary || "(No title)",
    // Only include fields you actually need
  })) || [];
```

## Key Takeaways
- **Use established core utilities before creating new ones**
- **Separate integration from business logic**
- **Follow established error handling patterns**
- **Keep types simple and outside functions**
- **Use `!` after validation instead of safe defaults**
- **Prioritize working code over architectural purity**
- **Always ask "can we simplify?" before adding complexity**