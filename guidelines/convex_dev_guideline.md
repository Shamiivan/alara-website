# Convex Development Guidelines

## Core Convex Rules
- ALWAYS use new function syntax: `export const f = action({ args: {}, returns: v.null(), handler: async (ctx, args) => {} })`
- ALWAYS include both `args` and `returns` validators for ALL functions
- Use `"use node";` at top of files with Node.js imports
- Never use `ctx.db` inside actions - actions don't have database access
- Use `internalAction`, `internalQuery`, `internalMutation` for private functions
- Use `action`, `query`, `mutation` for public API functions

## Architecture Principles

### 1. Separation of Concerns
- **Integration Layer**: Pure functions that call external APIs
  - Located in `integrations/` directory
  - No Convex dependencies - just pure TypeScript functions
  - Always throw errors with descriptive context
  - Example: `fetchCalendarEvents(accessToken, calendarId, options)`

- **Action Layer**: Convex functions that handle business logic
  - Located in `convex/` directory
  - Call integration functions directly (no wrapper internalActions needed)
  - Handle database operations and token management
  - Always return `Result<T>`, never throw to frontend

### 2. Error Handling Pattern
```typescript
// Integration functions - ALWAYS throw
export async function fetchCalendarEvents(token: string, id: string) {
  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch calendar events for ${id}: ${error.message}`);
  }
}

// Actions - ALWAYS return Result<T>
export const getCalendarEvents = action({
  handler: async (ctx, args): Promise<Result<CalendarEventsData>> => {
    try {
      const data = await fetchCalendarEvents(token, id);
      return Ok(data);
    } catch (error) {
      return Err(error.message);
    }
  }
});
```

### 3. Type Structure
```typescript
// Define data types OUTSIDE functions
type CalendarEventsData = {
  calendarId: string;
  events: Array<{...}>;
};

// Use Result<T> wrapper in return type
handler: async (ctx, args): Promise<Result<CalendarEventsData>> => {
  // Function returns Ok(data) or Err(message)
}
```

## Function Guidelines

### Action Patterns
- Use `"use node";` at top of files with Node.js imports
- Always include explicit Promise return types: `handler: async (ctx, args): Promise<Result<DataType>> => {}`
- ALWAYS include both `args` and `returns` validators for ALL Convex functions
- Use `ctx.runAction(internal.core.tokens.ensureValidToken, { userId })` for token management
- Include console.log for debugging with context
- Import `Result`, `Ok`, `Err` from `shared/result`

### Validator Patterns
```typescript
// Keep validators simple - use v.any() for flexibility
args: {
  userId: v.id("users"),
  events: v.array(v.any()),
  data: v.any(),
}

// Standard Result validator for actions
returns: v.union(
  v.object({ success: v.literal(true), data: v.any() }),
  v.object({ success: v.literal(false), error: v.string() })
)

// ALWAYS include both args and returns validators
export const myAction = action({
  args: { userId: v.id("users") },  // Required
  returns: v.null(),               // Required
  handler: async (ctx, args) => {
    return null;
  }
});
```

### TypeScript Best Practices
- Use type guards for null filtering: `.filter((item): item is NonNullType => item !== null)`
- Add explicit array types when needed: `const items: Array<ItemType> = []`
- Define types outside functions for reusability
- Use `any` for complex API response fields to avoid over-engineering
- ALWAYS add explicit Promise return types to action handlers
- Be strict with document IDs: use `Id<"tableName">` not `string`

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
  core/                    # Business logic organized by domain
    calendars/
      actions.ts           # Public calendar actions
      queries.ts           # Public calendar queries
    calls/
      actions.ts           # Public call actions
      mutations.ts         # Public call mutations
      queries.ts           # Public call queries
      types.ts             # Domain-specific types
    users/
      mutations.ts         # User management
      queries.ts           # User queries
  integrations/            # Pure external API functions
    google/
      calendar.ts          # fetchCalendars, fetchCalendarEvents
      auth.ts              # refreshAccessToken
      types.ts             # Google API response types
    elevenlabs/
      calls.ts             # ElevenLabs API functions
      types.ts             # ElevenLabs types
  shared/
    result.ts              # Result<T> helpers
  utils/                   # Shared utilities
    tokens.ts              # Token management utilities
    crypto.ts              # Cryptographic utilities
```

### Function Naming
- Actions: `getUserCalendars`, `getCalendarEvents`, `getAvailability`
- Integration: `fetchCalendars`, `fetchCalendarEvents`, `refreshAccessToken`
- Utilities: `ensureValidToken`, `extractTokenData`
- Queries: `getTokenById`, `getUserById`
- Mutations: `updateToken`, `createUser`
- Clear, descriptive names that indicate the layer and operation

## Simplification Rules

### Always Ask: "Can We Simplify?"
- Remove unused parameters and return fields
- Combine similar operations when logical
- Use `v.any()` instead of complex nested validators
- Cut intermediate abstraction layers
- Focus on core functionality first

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
- **Separate integration from business logic**
- **Follow established error handling patterns**
- **Keep types simple and outside functions**
- **Prioritize working code over architectural purity**
- **Always ask "can we simplify?" before adding complexity**