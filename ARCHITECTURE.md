# Event Logging System Architecture Plan

## 🎯 System Overview

A comprehensive event logging system that tracks all user interactions, system events, and errors across the Next.js application, stores critical events in Convex, with toggleable logging and performance optimization for the free tier.

## 📊 Current Codebase Analysis

### Technology Stack
- **Frontend**: Next.js 15.4.2 + React 19 + TypeScript
- **Backend**: Convex with @convex-dev/auth
- **Database**: Convex (users, calls, payments, stripeEvents tables)
- **Auth**: @convex-dev/auth with Google OAuth
- **Payments**: Stripe integration
- **Voice**: ElevenLabs API integration
- **Styling**: Tailwind CSS + shadcn/ui components

### Current State
- Basic console.log statements scattered throughout
- No centralized logging system
- No error tracking or user feedback system
- Limited debugging capabilities for production issues

## 🏗️ Proposed Architecture

### 1. Database Schema Design

```typescript
// convex/schema.ts - New events table
events: defineTable({
  // Core event data
  category: v.string(), // "auth", "onboarding", "payment", "calls", "ui", "system", "api", "error"
  type: v.string(), // "info", "warn", "error", "debug"
  message: v.string(),
  details: v.optional(v.any()), // JSON object with additional context
  
  // User context
  userId: v.optional(v.id("users")),
  sessionId: v.optional(v.string()),
  
  // Request context
  url: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  
  // Metadata
  timestamp: v.number(),
  source: v.string(), // "client", "server", "middleware", "api", "convex"
  
  // User-facing features
  showToUser: v.optional(v.boolean()), // Whether to display in UI
  userMessage: v.optional(v.string()), // User-friendly error message
  resolved: v.optional(v.boolean()), // For error tracking
})
  .index("by_user", ["userId"])
  .index("by_category", ["category"]) 
  .index("by_type", ["type"])
  .index("by_timestamp", ["timestamp"])
  .index("by_source", ["source"])
  .index("by_user_unresolved", ["userId", "resolved"])
```

### 2. Environment Configuration

```bash
# .env.local
ENABLE_EVENT_LOGGING=true
ENABLE_CLIENT_LOGGING=true
ENABLE_SERVER_LOGGING=true
ENABLE_SYSTEM_LOGGING=true
LOG_LEVEL=info # debug|info|warn|error
BATCH_EVENTS=true
MAX_EVENTS_PER_BATCH=10
BATCH_INTERVAL_MS=5000
```

### 3. Core Infrastructure

#### A. Client-Side Logger (`src/lib/eventLogger.ts`)
```typescript
interface EventData {
  category: string;
  type: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  details?: any;
  showToUser?: boolean;
  userMessage?: string;
}

class EventLogger {
  // Environment checks
  private isLoggingEnabled(): boolean
  private shouldLogToDatabase(type: string): boolean
  
  // Core logging methods
  logEvent(data: EventData): Promise<void>
  logError(error: Error, context?: any): Promise<void>
  logUserAction(action: string, details?: any): Promise<void>
  
  // Batching for performance
  private batchEvents: EventData[]
  private flushBatch(): Promise<void>
}
```

#### B. Server-Side Logger (with consola.js)
```typescript
// src/lib/serverLogger.ts
import { consola } from 'consola'

class ServerLogger {
  private logger = consola.withTag('alara-server')
  
  logRequest(req: NextRequest, context?: any): void
  logError(error: Error, context?: any): Promise<void>
  logSystemEvent(event: string, details?: any): Promise<void>
}
```

#### C. Convex Event Functions (`convex/events.ts`)
```typescript
// Database operations for events
export const logEvent = mutation({ ... })
export const getEventsByUser = query({ ... })
export const getUnresolvedErrors = query({ ... })
export const markErrorResolved = mutation({ ... })
export const getSystemHealth = query({ ... })
```

### 4. Integration Strategy

#### A. Client-Side Integration Points
1. **React Error Boundary** - Catch and log React errors
2. **Navigation Events** - Track page changes and user flow
3. **Form Interactions** - Log form submissions and validation errors
4. **API Call Wrapper** - Log API requests/responses/errors
5. **User Actions** - Button clicks, feature usage

#### B. Server-Side Integration Points
1. **Middleware Enhancement** (`src/middleware.ts`)
   - Log authentication attempts
   - Track route access and redirects
   - Performance monitoring

2. **API Routes** (`src/app/api/*/route.ts`)
   - Request/response logging
   - Error handling and reporting
   - External API call tracking

3. **Convex Functions** (all existing functions)
   - Database operation logging
   - Business logic events
   - System state changes

### 5. UI Components for Event Display

#### A. Developer Components (Dev Mode Only)
```typescript
// src/components/debug/EventLogPanel.tsx
<EventLogPanel 
  userId={userId}
  categories={['error', 'payment', 'auth']}
  realTime={true}
/>
```

#### B. User-Facing Components
```typescript
// src/components/errors/UserErrorDisplay.tsx
<UserErrorDisplay 
  errors={unresolvedErrors}
  onDismiss={markErrorResolved}
/>

// src/components/system/StatusIndicator.tsx
<SystemStatusIndicator 
  healthStatus={systemHealth}
/>
```

### 6. Event Categories & Examples

#### Authentication Events
```typescript
// Login attempt
logEvent({
  category: 'auth',
  type: 'info',
  message: 'User login attempt',
  details: { provider: 'google', success: true }
})

// Auth error
logEvent({
  category: 'auth',
  type: 'error', 
  message: 'Authentication failed',
  details: { provider: 'google', error: 'invalid_token' },
  showToUser: true,
  userMessage: 'Login failed. Please try again.'
})
```

#### Onboarding Events
```typescript
// Step progression
logEvent({
  category: 'onboarding',
  type: 'info',
  message: 'Onboarding step completed',
  details: { step: 'phone', data: { phone: '+1234567890' } }
})

// Validation error
logEvent({
  category: 'onboarding',
  type: 'error',
  message: 'Phone validation failed',
  details: { phone: 'invalid-format', step: 'phone' },
  showToUser: true,
  userMessage: 'Please enter a valid phone number.'
})
```

#### Payment Events
```typescript
// Payment initiation
logEvent({
  category: 'payment',
  type: 'info',
  message: 'Payment initiated',
  details: { amount: 2000, currency: 'usd' }
})

// Stripe webhook processing
logEvent({
  category: 'payment',
  type: 'error',
  message: 'Stripe webhook processing failed',
  details: { eventId: 'evt_123', error: 'signature_mismatch' }
})
```

#### System Events
```typescript
// ElevenLabs API call
logEvent({
  category: 'calls',
  type: 'info',
  message: 'Voice call initiated',
  details: { toNumber: '+1234567890', agentId: 'agent_123' }
})

// Database operation
logEvent({
  category: 'system',
  type: 'warn',
  message: 'High database query time',
  details: { query: 'getUserByPhone', duration: 2000 }
})
```

### 7. Performance Optimizations

#### A. Convex Free Tier Considerations
- **Function Calls**: 1M/month (batch events to reduce calls)
- **Storage**: 0.5 GiB (implement event cleanup/archiving)
- **Bandwidth**: 1 GiB/month (compress event data)

#### B. Optimization Strategies
1. **Event Batching**: Group multiple events into single Convex calls
2. **Smart Filtering**: Only store errors in database, log others to console
3. **Rate Limiting**: Prevent event spam from misbehaving components
4. **Async Operations**: Non-blocking logging that doesn't impact UX
5. **Event Cleanup**: Auto-delete old events to manage storage

#### C. Batching Implementation
```typescript
class EventBatcher {
  private batch: EventData[] = []
  private batchTimer: NodeJS.Timeout | null = null
  
  add(event: EventData): void {
    this.batch.push(event)
    
    if (this.batch.length >= MAX_BATCH_SIZE) {
      this.flush()
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), BATCH_INTERVAL)
    }
  }
  
  private async flush(): Promise<void> {
    if (this.batch.length === 0) return
    
    const events = [...this.batch]
    this.batch = []
    this.clearTimer()
    
    await convex.mutation(api.events.logEventBatch, { events })
  }
}
```

### 8. Implementation Priority

#### Phase 1: Core Infrastructure (Week 1)
1. Install consola.js dependency
2. Add events schema to Convex
3. Create core logging infrastructure
4. Implement environment toggles

#### Phase 2: Error Logging (Week 1)
1. Add error boundary for React errors
2. Implement server-side error logging
3. Create basic error display UI
4. Add error logging to existing functions

#### Phase 3: User Event Tracking (Week 2)
1. Add logging to onboarding flow
2. Implement payment event tracking
3. Add user interaction logging
4. Create debug panel for developers

#### Phase 4: Optimization & Polish (Week 2)
1. Implement event batching
2. Add performance monitoring
3. Create system health indicators
4. Add event cleanup/archiving

### 9. Testing Strategy

#### A. Unit Tests
- Logger functionality
- Event batching logic
- Environment toggle behavior

#### B. Integration Tests  
- End-to-end logging flows
- Database event storage
- UI component integration

#### C. Performance Tests
- Convex function call optimization
- Event batching effectiveness
- Memory usage monitoring

### 10. Monitoring & Maintenance

#### A. System Health Metrics
- Event logging success rate
- Database storage usage
- Function call quota usage
- Error resolution rate

#### B. Cleanup & Archiving
- Auto-delete events older than 30 days
- Archive critical events for longer retention
- Monitor storage usage and optimize

#### C. User Feedback Integration
- Allow users to report issues
- Track error resolution effectiveness
- Gather feedback on user-facing error messages

## 🚀 Expected Outcomes

1. **Complete Visibility**: Track all user journeys and system events
2. **Improved Debugging**: Quick identification of issues in production
3. **Better UX**: User-friendly error messages and system feedback
4. **Performance Insights**: Monitor system health and bottlenecks
5. **Data-Driven Decisions**: Analytics on user behavior and system usage

## 📊 Success Metrics

- 95% error event capture rate
- <100ms average logging overhead
- Stay within Convex free tier limits
- 90% faster issue resolution time
- Improved user satisfaction scores

---

This architecture provides a robust, scalable event logging system that balances comprehensive tracking with performance optimization for the Convex free tier.