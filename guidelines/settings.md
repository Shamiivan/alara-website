# Settings Card Design Guidelines

## Core Philosophy
**Design settings as relationship-building moments.** Users are most vulnerable when deciding what control to give your product. Every design choice should reduce anxiety and increase confidence.

## Visual Design System

### Container Architecture - "Outer room sets mood"
```css
/* Base card - calm, stable containers */
.setting-card {
  @apply bg-white rounded-xl border border-slate-50 p-6;
  @apply hover:border-slate-100; /* Gentle acknowledgment, no aggressive hovers */
  /* Soft borders over sharp: #F1F5F9 instead of #E2E8F0 */
}

/* Header pattern - consistent hierarchy */
.card-header {
  @apply flex items-center gap-3 mb-6;
}
.card-icon {
  @apply p-2 bg-blue-50 rounded-lg transition-colors duration-200;
}
.card-title {
  @apply font-medium text-slate-900; /* Firm, factual */
}
.card-subtitle {
  @apply text-sm text-slate-600; /* Gentle, conversational */
}
```

### Color Palette - Semantic & Gentle
- **Primary**: `blue-50/600`, `indigo-50/600` (for primary actions, selected states)
- **Neutral**: `slate-100/200/600/900` (structure, hierarchy, text)
- **Error**: `red-50/100/600/800` (soft, not alarming)
- **Success/Active**: Inherit from primary blues
- **Avoid**: High saturation, vibrant colors, stark contrasts

### Motion Philosophy - "Every hover is a whisper, not a shout"
```css
/* Micro-interactions as empathy */
.gentle-hover {
  @apply hover:border-slate-100 hover:scale-[1.01]; /* Whisper acknowledgment */
}

/* Interactive elements reward engagement */
.toggle-breathe {
  @apply hover:scale-[1.03] transition-transform duration-200;
}

/* Disabled items "sleep" rather than disappear */
.sleeping-state {
  @apply scale-95 opacity-60 transition-all duration-300;
}

/* Progressive disclosure - helpful context on hover */
.context-reveal {
  @apply opacity-0 group-hover:opacity-100 transition-opacity duration-200;
}
```

## Content & Tone Architecture

### Copy as Care - Address fears proactively
```typescript
interface CardContent {
  title: string;        // Confident simplicity ("Calendar Access")
  subtitle: string;     // User-centric explanation ("Which calendar should we use...")
  primary?: {           // Explain the why
    label: string;      // Clear role ("Primary")
    description: string; // "Primary = compass. We follow this one if others disagree"
  };
  options?: {           // Replace defensive with confident
    prompt: string;     // "Should we check this one too..."
    confirmation: string; // "Added for planning" (not "Calendar updated successfully")
  };
  footer?: string;      // Proactive reassurance ("Events stay safe")
}
```

### User Mental Model Patterns

**Address vulnerability with confidence**
- Primary calendar: *"Primary = compass. We follow this one if others disagree"*
- Privacy footer: *"Events stay safe — you can come back anytime"*
- System behavior: *"We'll check this one when planning"*

**User-centric naming & language**
- Use: `isEnabled`, `toggleCalendar`, "Should we check this..."
- Avoid: `status`, `updateCalendarStatus`, "Calendar configuration updated"
- Focus: What the user gets, not what the system does

### Tooltips as Tiny Therapists
```typescript
// Appear when users need reassurance most
<div title="We can only view this one — no changes needed">
  <Shield className="w-3 h-3 text-slate-400" />
</div>

// Context that reduces anxiety
<span title="Events stay safe — we only read, never change">
  Read-only access
</span>
```

## React Implementation Patterns

### State mirrors user mental models
```typescript
// Primary calendars are special (not just first in array)
const [primaryCalendar, setPrimaryCalendar] = useState<Calendar | null>(null);

// Disabled = paused, not broken
const [pausedCalendars, setPausedCalendars] = useState<Set<string>>(new Set());

// Component structure as conversation flow
const SettingsCard = () => (
  <div className="setting-card"> {/* Outer "room" sets calm mood */}
    <CardHeader />               {/* Essential info always visible */}
    <PrimarySection />           {/* Special treatment for compass */}
    <OptionsSection />           {/* Interactive dialogue */}
    <ReassuranceFooter />        {/* Proactive comfort */}
  </div>
);
```
### Loading States - Context reduces anxiety
```typescript
// Contextual, reassuring loading
<div className="flex items-center gap-3 text-slate-500">
  <Loader2 className="w-5 h-5 animate-spin" />
  <span className="text-sm">Getting your calendars ready...</span>
</div>
```

### Error States - Confident simplicity
```typescript
// Skip defensive language, address the path forward
<div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
  <div>
    <p className="text-sm text-red-800">Couldn't reach your calendars right now.</p>
    <button className="text-sm text-red-700 hover:text-red-800 underline mt-1">
      Try again
    </button>
  </div>
</div>
```

### Progressive Disclosure
```typescript
// Essential visible, context on hover
<div className="group">
  <p className="text-slate-600">Primary calendar</p>
  <p className="context-reveal text-xs text-slate-500 mt-1">
    We follow this one if others disagree
  </p>
</div>
```

## The Test
**Would this make someone stop and think "they get it"?** 

If your settings feel like a thoughtful friend helping you organize your life rather than a cold admin panel, you're on the right track. Every interaction should reduce anxiety about giving your product control, and increase confidence that it understands what matters to the user.