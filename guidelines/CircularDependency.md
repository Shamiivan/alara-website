# TypeScript Circular Reference Fix

## The Problem
```
'handler' implicitly has return type 'any'...
'X' implicitly has type 'any'...
```

TypeScript can't figure out types when functions call each other.

## The Fix

**Add explicit types to break the cycle:**

```typescript
// ❌ Error
handler: async (ctx, args) => {
  const result = await ctx.runQuery(internal.example.getData, args);
  return result;
}

// ✅ Fixed  
handler: async (ctx, args): Promise<string> => {  // <- Add this
  const result: MyType = await ctx.runQuery(...);  // <- And this
  return result;
}
```

## Quick Rules

1. **Handler functions**: Add `Promise<ReturnType>` 
2. **Variables calling other functions**: Add explicit type
3. **Called functions**: Must have `returns` validator

Done.