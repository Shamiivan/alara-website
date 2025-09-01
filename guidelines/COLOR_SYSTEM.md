# Alara Color System Documentation

## Overview

The Alara color system has been designed to create a cohesive, trust-building visual experience that reflects the brand's values of reliability, warmth, and approachable AI interaction.

## Color Palette

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

## CSS Custom Properties

### Light Mode
```css
:root {
  /* Primary Colors */
  --primary: 244 75% 59%;
  --primary-light: 226 100% 94%;
  --primary-dark: 244 75% 45%;
  --primary-foreground: 0 0% 100%;

  /* Secondary Colors */
  --secondary: 255 91% 76%;
  --secondary-foreground: 244 75% 20%;

  /* Semantic Colors */
  --voice-accent: 173 80% 40%;
  --success: 155 84% 39%;
  --accent: 38 92% 50%;
  --destructive: 0 84% 60%;

  /* Voice UI */
  --voice-bg: 226 100% 97%;
  --voice-user: 155 84% 39%;
  --voice-ai: 255 91% 76%;
}
```

### Dark Mode
```css
.dark {
  /* Primary Colors (adjusted for dark mode) */
  --primary: 244 75% 65%;
  --primary-light: 226 100% 25%;
  --primary-dark: 244 75% 75%;

  /* Secondary Colors */
  --secondary: 255 91% 80%;
  --secondary-foreground: 0 0% 100%;

  /* Semantic Colors */
  --voice-accent: 173 80% 50%;
  --success: 155 84% 50%;
  --accent: 38 92% 65%;

  /* Voice UI */
  --voice-bg: 224 71% 10%;
  --voice-user: 155 84% 50%;
  --voice-ai: 255 91% 80%;
}
```

## Usage Guidelines

### Primary Color (Deep Indigo)
- **Use for**: Main CTAs, primary navigation, key headlines
- **Don't use for**: Large background areas, body text
- **Accessibility**: Provides excellent contrast on white backgrounds

### Secondary Color (Warm Purple)
- **Use for**: Secondary actions, feature badges, accent elements
- **Don't use for**: Primary CTAs, error states
- **Accessibility**: Use with dark text for optimal readability

### Voice Accent (Teal)
- **Use for**: Voice-related UI, audio controls, conversation elements
- **Don't use for**: Non-voice related features
- **Accessibility**: High contrast, suitable for important interactive elements

### Success, Warning, Error
- **Use for**: System feedback, form validation, status indicators
- **Don't use for**: General decoration or branding
- **Accessibility**: All colors meet WCAG 2.1 AA standards

## Implementation Examples

### Using in Tailwind CSS
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

