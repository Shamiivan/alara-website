# ESLint Build Error Analysis

## Identified Issues:

### 1. React Unescaped Entities (5 instances)
**Rule:** `react/no-unescaped-entities`
**Problem:** Apostrophes (`'`) in JSX text need proper escaping

**Files affected:**
- `src/components/ErrorBoundary.tsx:67` - "Don't worry - we've been notified"
- `src/app/dashboard/page.tsx:108` - "You're all set up"  
- `src/app/payment/page.tsx:25` - "You're almost there!"
- `src/app/payment/page.tsx:42` - "you're ready"
- `src/app/payment/page.tsx:61` - "What you'll get:"
- `src/app/payment/page.tsx:67` - "Full access to Alara's features"

### 2. TypeScript Any Types (43 instances)
**Rule:** `@typescript-eslint/no-explicit-any`
**Problem:** ESLint is rejecting all `any` types, requires proper typing

**Files affected:**
- `src/app/api/calls/route.ts` - 1 instance
- `src/app/calls/page.tsx` - 1 instance  
- `src/lib/eventLogger.ts` - 21 instances
- `src/lib/serverLogger.ts` - 20 instances

### 3. Unused Variables/Imports (12 instances)
**Rule:** `@typescript-eslint/no-unused-vars`
**Problem:** Unused imports and variables should be removed

**Files affected:**
- Multiple files with unused imports like `Image`, `ConvexProvider`, etc.

## Root Cause Analysis:

1. **ESLint Configuration**: Project uses Next.js strict config with TypeScript rules
2. **Logging Libraries**: Heavy use of `any` types in logging code needs proper interfaces
3. **JSX Content**: Apostrophes need HTML entity encoding in JSX

## Impact:
- Build fails during Vercel deployment
- Prevents production deployment
- All issues are linting errors, not runtime errors

## Proposed Solution Strategy:
1. Replace apostrophes with HTML entities (`&apos;` or `&#39;`)
2. Create proper TypeScript interfaces for logger methods
3. Remove unused imports/variables
4. Consider ESLint rule adjustments if needed