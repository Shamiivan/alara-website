# Alara Design Guidelines

This document provides a comprehensive guide to Alara's design system, ensuring consistency across all user interfaces.

## Table of Contents
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing](#spacing)
- [Border Radius](#border-radius)
- [Animations & Transitions](#animations--transitions)
- [Component Guidelines](#component-guidelines)
- [Voice UI Guidelines](#voice-ui-guidelines)
- [Implementation Examples](#implementation-examples)

## Color System

The Alara color system creates a cohesive, trust-building visual experience that reflects our brand values of reliability, warmth, and approachable AI interaction.

### Primary Brand Colors

| Color | Hex Code | HSL Value | Usage |
|-------|----------|-----------|--------|
| **Deep Indigo** | `#4F46E5` | `244 75% 59%` | Primary actions, headlines, key UI elements |
| **Soft Lavender** | `#E0E7FF` | `226 100% 94%` | Light backgrounds, subtle accents |
| **Warm Purple** | `#A78BFA` | `255 91% 76%` | Secondary actions, feature highlights |

### Semantic Colors

| Color | Hex Code | HSL Value | Usage |
|-------|----------|-----------|--------|
| **Voice Accent (Teal)** | `#14B8A6` | `173 80% 40%` | Voice interactions, audio elements |
| **Success (Soft Green)** | `#10B981` | `155 84% 39%` | Success states, positive feedback |
| **Warning (Warm Orange)** | `#F59E0B` | `38 92% 50%` | Warnings, attention-drawing elements |
| **Error (Soft Red)** | `#EF4444` | `0 84% 60%` | Error states, destructive actions |

### Light Mode and Dark Mode

Our color system automatically adjusts for light and dark modes, ensuring proper contrast and visibility in both contexts.

**Dark Mode Adjustments:**
- Primary colors are brightened for better visibility
- Background and foreground colors invert
- Contrast ratios are maintained for accessibility

## Typography

Alara uses a clean, modern typography system based on the Geist font family.

### Font Families

- **Primary Font:** Geist Sans
- **Monospace Font:** Geist Mono

### Font Sizes

| Size | Value | Usage |
|------|-------|-------|
| XS | 0.75rem (12px) | Fine print, footnotes |
| SM | 0.875rem (14px) | Secondary text, captions |
| Base | 1rem (16px) | Body text, default size |
| LG | 1.125rem (18px) | Emphasized text |
| XL | 1.25rem (20px) | Small headings |
| 2XL | 1.5rem (24px) | Subheadings |
| 3XL | 1.875rem (30px) | Section headings |
| 4XL | 2.25rem (36px) | Page headings |
| 5XL | 3rem (48px) | Hero text, major headlines |

### Font Weights

- **Normal:** 400
- **Medium:** 500
- **Semibold:** 600
- **Bold:** 700

### Line Heights

- **Tight:** 1.25 - For headings and compact layouts
- **Normal:** 1.5 - For body text and general content
- **Relaxed:** 1.625 - For improved readability in longer text blocks
- **Loose:** 2 - For very spacious, airy text layouts

### Typographic Best Practices

- Use `tracking-tight` for headings to reduce letter spacing
- Maintain clear hierarchy with font sizes and weights
- Ensure sufficient contrast between text and background
- Use italics sparingly, primarily for voice-text representations

## Spacing

Our spacing system provides consistent measurements across the interface.

| Size | Value | Usage |
|------|-------|-------|
| 1 | 0.25rem (4px) | Minimum spacing, tight layouts |
| 2 | 0.5rem (8px) | Compact elements, inner padding |
| 3 | 0.75rem (12px) | Small gaps, icon padding |
| 4 | 1rem (16px) | Standard spacing, component padding |
| 6 | 1.5rem (24px) | Medium spacing between sections |
| 8 | 2rem (32px) | Large spacing, section separation |
| 12 | 3rem (48px) | Extra large spacing, major sections |
| 16 | 4rem (64px) | Maximum spacing, page sections |

### Spacing Guidelines

- Use consistent spacing for similar UI elements
- Apply larger spacing for separation between distinct sections
- Use smaller spacing for related elements
- Maintain consistent rhythm throughout layouts

## Border Radius

Alara uses a rounded design language with consistent radius values.

| Size | Value | Usage |
|------|-------|-------|
| Base Radius | 0.625rem (10px) | The foundation for all radius values |
| Small (SM) | 0.375rem (6px) | Tight corners, small elements |
| Medium (MD) | 0.5rem (8px) | Buttons, input fields |
| Large (LG) | 0.625rem (10px) | Cards, larger elements |
| Extra Large (XL) | 0.875rem (14px) | Prominent elements, modals |

### Border Radius Best Practices

- Use consistent radius values throughout the interface
- Apply larger radius to larger elements
- Consider the visual hierarchy when choosing radius sizes

## Animations & Transitions

Alara uses smooth, purposeful animations to enhance the user experience.

### Transition Durations

| Type | Duration | Usage |
|------|----------|-------|
| Fast | 150ms | Small UI elements, quick feedback |
| Normal | 250ms | Standard transitions, hover states |
| Slow | 350ms | Larger UI changes, emphasis |
| Bounce | 500ms | Attention-grabbing, playful elements |

### Animation Types

- **Fade In:** Smooth appearance for elements entering the viewport
- **Wiggle:** Gentle side-to-side movement for attention
- **Wave:** Rotating movement, often used for interactive elements
- **Bounce:** Vertical movement, emphasizing important elements
- **Subtle Bounce:** Gentle vertical movement for subtle emphasis

### Animation Best Practices

- Use animations purposefully, not decoratively
- Keep animations subtle and brief
- Ensure animations don't delay user interaction
- Consider reducing motion for accessibility

## Component Guidelines

### Buttons

Alara uses a consistent button system with multiple variants.

#### Button Variants

- **Default:** Primary actions, main CTAs (`bg-primary text-primary-foreground`)
- **Secondary:** Alternative actions (`bg-secondary text-secondary-foreground`)
- **Destructive:** Dangerous or irreversible actions (`bg-destructive text-white`)
- **Outline:** Secondary options, less emphasis (`border bg-background`)
- **Ghost:** Subtle actions, minimal visual weight (`hover:bg-accent`)
- **Link:** Text-only buttons, for navigation (`text-primary underline-offset-4`)

#### Button Sizes

- **Default:** Standard size for most contexts (`h-9 px-4 py-2`)
- **Small:** Compact spaces, secondary actions (`h-8 px-3`)
- **Large:** Primary CTAs, important actions (`h-10 px-6`)
- **Icon:** Square buttons for icon-only displays (`size-9`)

### Cards

Use cards to group related content in distinct containers.

- Apply consistent padding within cards (`p-6`)
- Maintain sufficient spacing between cards (`gap-4` or larger)
- Use subtle shadows for depth (`shadow-xs`)
- Apply consistent border radius (`rounded-lg`)

### Forms and Inputs

- Maintain consistent sizing of form elements
- Use clear labels above input fields
- Provide appropriate validation feedback
- Maintain sufficient spacing between form elements

## Voice UI Guidelines

Alara has specialized design patterns for voice interactions.

### Voice UI Colors

- **Voice Background:** Light subtle background for voice areas
- **Voice Accent:** Teal highlighting for active voice elements
- **Voice User:** Green tones for user speech elements
- **Voice AI:** Purple tones for AI speech elements

### Conversation Bubbles

- **User Bubbles:** Right-aligned, user-colored backgrounds
- **AI Bubbles:** Left-aligned, AI-colored backgrounds

### Voice UI Best Practices

- Use italic text for voice content
- Maintain clear visual distinction between user and AI content
- Apply subtle animations for active voice elements
- Use consistent spacing between conversation elements

## Implementation Examples

### Using with Tailwind CSS

```jsx
// Primary button
<button className="bg-primary text-primary-foreground">
  Join Program
</button>

// Voice interaction element
<div className="bg-voice-accent text-white">
  Voice Active
</div>

// Success feedback
<div className="text-success bg-success/10">
  Task completed!
</div>
```

### Using with HSL Variables

```jsx
// Custom styling with opacity
<div className="bg-[hsl(var(--primary)/0.1)]">
  Light primary background
</div>

// Voice conversation bubbles
<div className="bg-[hsl(var(--voice-user)/0.15)]">
  User message
</div>
```

### Applying Animation Classes

```jsx
// Fade-in animation
<div className="fade-in">
  Content that fades in
</div>

// Subtle bouncing element
<button className="animate-subtle-bounce">
  Click me
</button>