# Frontend Refactor Analysis

# Day 1: Setup Primitives Foundation - Detailed Implementation Plan

**Time**: 3-4 hours  
**Goal**: Create the building blocks for all future development

## Prerequisites

- [ ] Current codebase is committed and pushed
- [ ] Create new branch: `git checkout -b refactor/primitives-foundation`
- [ ] Backup current layout files (if needed)

---

## Morning Session (2 hours): Create Primitives

### Step 1: Create Folder Structure (5 minutes)

```bash
# Navigate to your project root
cd src

# Create the primitives folder structure
mkdir -p components/primitives/layouts
mkdir -p components/primitives/feedback
mkdir -p hooks
mkdir -p types

# Verify structure
tree components/primitives
```

**Expected result**:
```
components/primitives/
├── layouts/
└── feedback/
```

### Step 2: Implement Layout Primitives (60 minutes)

#### 2.1 Create AppShell Component (20 minutes)

**File**: `src/components/primitives/layouts/AppShell.tsx`

```tsx
"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import Sidebar from "@/components/dashboard/navigation/SiderBar";
import MobileMenuButton from "@/components/dashboard/navigation/MobileMenu";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [manuallyOpened, setManuallyOpened] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      } else if (mobile && sidebarOpen && !manuallyOpened) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [sidebarOpen, manuallyOpened]);

  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen, isMobile]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="layout-shell">
      <MobileMenuButton
        onClick={() => {
          setManuallyOpened(true);
          setSidebarOpen(true);
        }}
        isOpen={sidebarOpen}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => {
          setManuallyOpened(false);
          setSidebarOpen(false);
        }}
      />

      <main
        className={`main-content ${!isMobile && sidebarOpen ? 'ml-80' : 'ml-0'}`}
      >
        {children}
      </main>
    </div>
  );
}
```

**Testing checkpoint**: Save file and verify no by running 

```
npm run lint && npm run type-check 
```

#### 2.2 Create Page Component 

**File**: `src/components/primitives/layouts/Page.tsx`

```tsx
import React from 'react';

interface PageProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl', 
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none'
};

export function Page({ 
  children, 
  title, 
  subtitle, 
  actions, 
  maxWidth = 'lg',
  className = ''
}: PageProps) {
  return (
    <div className={`content-wrapper ${maxWidthClasses[maxWidth]} ${className}`}>
      {(title || subtitle || actions) && (
        <div className="page-header">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {title && <h1 className="page-title">{title}</h1>}
              {subtitle && <p className="page-description">{subtitle}</p>}
            </div>
            {actions && (
              <div className="flex items-center gap-2 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="spacing-content">
        {children}
      </div>
    </div>
  );
}
```

#### 2.3 Create Card Component (10 minutes)

**File**: `src/components/primitives/layouts/Card.tsx`

```tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const cardVariants = {
  default: 'card-base',
  elevated: 'card-elevated', 
  outlined: 'card-base border-2'
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export function Card({ 
  children, 
  variant = 'default', 
  padding = 'md', 
  className = '',
  onClick 
}: CardProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={`
        ${cardVariants[variant]} 
        ${paddingClasses[padding]} 
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `.trim()}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}
```

#### 2.4 Create Section Component (10 minutes)

**File**: `src/components/primitives/layouts/Section.tsx`

```tsx
import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spacingClasses = {
  sm: 'space-y-4',
  md: 'space-y-6',
  lg: 'space-y-8'
};

export function Section({ 
  children, 
  title, 
  subtitle, 
  spacing = 'md',
  className = ''
}: SectionProps) {
  return (
    <section className={`${spacingClasses[spacing]} ${className}`}>
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className={spacingClasses[spacing]}>
        {children}
      </div>
    </section>
  );
}
```

#### 2.5 Create Layouts Index File (5 minutes)

**File**: `src/components/primitives/layouts/index.ts`

```tsx
export { AppShell } from './AppShell';
export { Page } from './Page';
export { Card } from './Card';
export { Section } from './Section';
```

### Step 3: Implement Feedback Primitives (30 minutes)

#### 3.1 Create LoadingState Component (15 minutes)

**File**: `src/components/primitives/feedback/LoadingState.tsx`

```tsx
import React from 'react';

interface LoadingStateProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'skeleton' | 'spinner' | 'pulse';
}

export function LoadingState({ 
  width = "w-full", 
  height = "h-32", 
  className = "",
  variant = 'skeleton'
}: LoadingStateProps) {
  if (variant === 'spinner') {
    return (
      <div className={`flex items-center justify-center ${width} ${height} ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`bg-muted/30 animate-pulse rounded-lg ${width} ${height} ${className}`}></div>
    );
  }

  // skeleton variant (default)
  return (
    <div className={`rounded-xl bg-muted/10 p-3 ${width} ${height} animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="w-4 h-4 bg-muted/30 rounded"></div>
        <div className="w-16 h-3 bg-muted/30 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="w-full h-3 bg-muted/30 rounded"></div>
        <div className="w-3/4 h-3 bg-muted/30 rounded"></div>
      </div>
    </div>
  );
}
```

#### 3.2 Create ErrorDisplay Component (10 minutes)

**File**: `src/components/primitives/feedback/ErrorDisplay.tsx`

```tsx
import React from 'react';

interface ErrorDisplayProps {
  error: string;
  retry?: () => void;
  variant?: 'inline' | 'card' | 'page';
}

export function ErrorDisplay({ error, retry, variant = 'inline' }: ErrorDisplayProps) {
  const baseClasses = "text-sm";
  const variantClasses = {
    inline: "text-red-600",
    card: "p-4 bg-red-50 border border-red-200 rounded-lg",
    page: "p-6 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <div className="font-medium text-red-700 mb-2">Unable to load data</div>
      <div className="text-red-600 mb-3">{error}</div>
      {retry && (
        <button
          onClick={retry}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
```

#### 3.3 Create Feedback Index File 
**File**: `src/components/primitives/feedback/index.ts`

```tsx
export { LoadingState } from './LoadingState';
export { ErrorDisplay } from './ErrorDisplay';
```

### Step 4: Create Main Primitives Index 

**File**: `src/components/primitives/index.ts`

```tsx
export * from './layouts';
export * from './feedback';
```

### Step 5: Testing Checkpoint 
1. **Verify all files compile**:
```bash
npm run lint && npm run typ-check 
# or
npm run type-check
```


## Afternoon Session (1-2 hours): Fix Layout Conflicts

### Step 6: Create Public Layout Group (20 minutes)

#### 6.1 Create Public Directory
```bash
mkdir src/app/\(public\)
```

#### 6.2 copy the landing page to Landing Page
```bash
# Backup current page
cp src/app/page.tsx src/app/page.tsx.backup

# Move to public group
mv src/app/page.tsx src/app/\(public\)/page.tsx
```

#### 6.3 Create Public Layout

**File**: `src/app/(public)/layout.tsx`

```tsx
import { Navbar, Footer } from "@/components/navigation";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main id="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
}
```

#### 6.4 Update Landing Page

**File**: `src/app/(public)/page.tsx`

```tsx
"use client"
import Hero from "@/components/landing/Hero"
import Problem from "@/components/landing/Problem"
import WhatWereBuilding from "@/components/landing/WhatWereBuilding"
import HowItWorks from "@/components/landing/HowItWorks"

export default function Home() {
  return (
    <div className="font-sans">
      <Hero />
      <Problem />
      <WhatWereBuilding />
      <HowItWorks />
    </div>
  );
}
```

### Step 7: Update App Layout 
#### 7.1 Backup Current App Layout
```bash
cp src/app/app/layout.tsx src/app/app/layout.tsx.backup
```

#### 7.2 Replace App Layout

**File**: `src/app/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/primitives/layouts";

export const metadata: Metadata = {
  title: "Dashboard | Alara",
  description: "Your productivity workspace",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
```

#### 7.3 Update Root Layout

**File**: `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { NavigationProvider } from "@/components/navigation/useNavigation";
import HydrationDebugger from "@/components/HydrationDebugger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alara | Productivity",
  description: "A voice-first productivity platform that acts as your trusted thinking partner, helping you navigate daily challenges through conversation rather than complexity.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexAuthNextjsServerProvider>
          <ConvexClientProvider>
            <NavigationProvider>
              <HydrationDebugger />
              {children}
            </NavigationProvider>
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
```

### Step 8: Create Test Page (20 minutes)

#### 8.1 Create Test Directory
```bash
mkdir -p src/app/app/test-primitives
```

#### 8.2 Create Test Page

**File**: `src/app/app/test-primitives/page.tsx`

```tsx
"use client";

import { Page, Card, Section } from "@/components/primitives/layouts";
import { LoadingState, ErrorDisplay } from "@/components/primitives/feedback";

export default function TestPrimitivesPage() {
  return (
    <Page 
      title="Test Primitives" 
      subtitle="Testing our new layout system"
      maxWidth="xl"
      actions={
        <button className="btn-base btn-primary px-4 py-2">
          Test Action
        </button>
      }
    >
      <Section title="Layout Primitives" spacing="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <h3 className="font-semibold mb-2">Default Card</h3>
            <p className="text-muted-foreground">This is a default card with standard styling.</p>
          </Card>
          
          <Card variant="elevated">
            <h3 className="font-semibold mb-2">Elevated Card</h3>
            <p className="text-muted-foreground">This card has elevated shadow styling.</p>
          </Card>
          
          <Card variant="outlined">
            <h3 className="font-semibold mb-2">Outlined Card</h3>
            <p className="text-muted-foreground">This card has an outlined border.</p>
          </Card>
        </div>
      </Section>

      <Section title="Interactive Elements">
        <Card 
          onClick={() => alert('Card clicked!')} 
          variant="elevated"
          className="hover:scale-105 transition-transform"
        >
          <h3 className="font-semibold mb-2">Clickable Card</h3>
          <p className="text-muted-foreground">Click me to test interaction!</p>
        </Card>
      </Section>

      <Section title="Feedback Components">
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-4">Loading States</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Skeleton</p>
                <LoadingState variant="skeleton" height="h-24" />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Spinner</p>
                <LoadingState variant="spinner" height="h-24" />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Pulse</p>
                <LoadingState variant="pulse" height="h-24" />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Error States</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Inline Error</p>
                <ErrorDisplay 
                  error="This is an inline error message" 
                  variant="inline"
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Card Error</p>
                <ErrorDisplay 
                  error="This is a card error with retry" 
                  variant="card"
                  retry={() => alert('Retry clicked!')}
                />
              </div>
            </div>
          </Card>
        </div>
      </Section>
    </Page>
  );
}
```


## Success Criteria Validation

### ✅ Checklist
- [ ] **No layout conflicts**: Landing page has navbar/footer, app pages have sidebar only
- [ ] **Primitives folder created**: All components compile without errors
- [ ] **Test page works**: All primitives display and function correctly
- [ ] **Mobile responsive**: Layout adapts automatically on mobile devices
- [ ] **TypeScript happy**: No compilation errors
- [ ] **Build succeeds**: Production build completes successfully

### 🚨 Troubleshooting

**If navbar appears on app pages**:
- Check that `src/app/app/layout.tsx` only contains `AppShell`
- Verify `src/app/layout.tsx` doesn't include `<Navbar>`

**If TypeScript errors**:
- Check import paths use `@/components/primitives`
- Verify all index.ts files export correctly
- Check that all component interfaces are properly typed

**If mobile menu doesn't work**:
- Verify `MobileMenuButton` and `Sidebar` components exist
- Check that AppShell is managing mobile state correctly
- Test window resize behavior

**If styling looks wrong**:
- Verify your `globals.css` includes the layout utility classes
- Check that Tailwind is processing the primitive components
- Confirm Card variants are using defined CSS classes

### 📈 Success Metrics

After completing Day 1, you should have:
- **8 new primitive components** ready for use
- **Clean separation** between public and app layouts
- **Mobile-first responsive design** working automatically
- **Foundation** for 80% faster component development

### 🎯 Next Steps Preparation

Day 1 sets up the foundation. Tomorrow you'll:
1. Extract your first data hook
2. Create your first view component using primitives
3. Prove the data flow pattern works end-to-end

The primitives you built today will be used in every component going forward, providing consistency and speed for all future development.

#### Default Exports (68 components)
- `src/components/calendar/WeekSectionComponent.tsx` (line 530) - Rolling7DayStrip
- `src/components/SideBar.tsx` (line 319) - AppLayout
- `src/components/settings/ClarityCallsSettingsCard.tsx` (line 314) - ClarityCallsSettingsCard
- `src/components/dashboard/NextCallCard.tsx` (line 28) - NextCallCard
- `src/components/dashboard/navigation/MobileMenu.tsx` (line 17) - MobileMenuButton
- `src/components/dashboard/navigation/SiderBar.tsx` (line 64) - Sidebar
- `src/components/dashboard/PageHeader.tsx` (line 12) - PageHeader
- `src/components/navigation/README.md` (line 21) - Layout (example)
- `src/components/navigation/MobileNav/MobileNavItem.tsx` (line 101) - MobileNavItem
- `src/components/navigation/MobileNav/MobileNavOverlay.tsx` (line 31) - MobileNavOverlay
- `src/components/navigation/MobileNav/MobileNav.tsx` (line 182) - MobileNav
- `src/components/navigation/MobileNav/HamburgerButton.tsx` (line 67) - HamburgerButton
- `src/components/ColorPalette.tsx` (line 190) - ColorPalette
- `src/components/HydrationDebugger.tsx` (line 5) - HydrationDebugger
- `src/components/onboarding/OnboardingForm.tsx` (line 26) - OnboardingForm
- `src/components/navigation/Navbar/NavbarCTA.tsx` (line 87) - NavbarCTA
- `src/components/navigation/Navbar/NavbarItem.tsx` (line 173) - NavbarItem
- `src/components/navigation/Navbar/Navbar.tsx` (line 37) - Navbar
- `src/components/navigation/Navbar/NavbarBrand.tsx` (line 43) - NavbarBrand
- `src/components/navigation/Navbar/NavbarNav.tsx` (line 47) - NavbarNav
- `src/components/navigation/UserMenu/UserMenuItem.tsx` (line 62) - UserMenuItem
- `src/components/navigation/UserMenu/UserAvatar.tsx` (line 67) - UserAvatar
- `src/components/navigation/UserMenu/UserMenu.tsx` (line 142) - UserMenu
- `src/components/tasks/TodoApp.tsx` (line 209) - TodoApp
- `src/components/payments/TestPaymentButton.tsx` (line 8) - PaymentButton
- `src/components/settings/SettingCard.tsx` (line 225) - CalendarSettingsCard
- `src/components/landing/AudioPlayer.tsx` (line 71) - AudioPlayer
- `src/components/landing/WhoThisIsFor.tsx` (line 108) - WhoThisIsFor
- `src/components/landing/Features.tsx` (line 76) - Features
- `src/components/landing/DemoSection.tsx` (line 88) - DemoSection
- `src/components/landing/Hero.tsx` (line 91) - Hero
- `src/components/landing/Vision.tsx` (line 103) - Vision
- `src/components/landing/Problem.tsx` (line 195) - Problem
- `src/components/landing/WhatWereBuilding.tsx` (line 253) - WhatWereBuilding
- `src/components/landing/HowItWorks.tsx` (line 97) - HowItWorks
- `src/components/landing/TypingAnimation.tsx` (line 54) - TypingAnimation
- `src/components/calendar/CalendarEventList.tsx` (line 115) - CalendarEventsList

#### Named Exports (75 functions/components)
- `src/lib/eventLogger.ts` - logger, useEventLogger
- `src/lib/serverLogger.ts` - serverLogger, authLogger, apiLogger, systemLogger, paymentLogger, callLogger
- `src/lib/api.ts` - useCurrentUser, useIsUserOnboarded, useCompleteOnboarding, useEnsureUserRecord
- `src/lib/featureGate.ts` - useCalendarV1Enabled
- `src/lib/utils.ts` - cn, convertUserTimeToUTC, convertUTCToUserTime, getNextOccurrenceUTC, isValidTimezone, getDefaultTimeZone, getAllTimeZones, formatInTZ, utcToLocalFields, localFieldsToUtcISO, roundNowToNext15, testTimeConversions
- `src/lib/telemetry.ts` - useTelemetry
- `src/lib/routes.ts` - getPublicRoutes, getProtectedRoutes, getRoutesRequiringOnboarding, getRoutesRequiringPayment, getNavItems, getUserNavItems, getUserMenuItems, getRouteConfig
- `src/components/ErrorBoundary.tsx` - withErrorBoundary, AuthErrorBoundary, OnboardingErrorBoundary, PaymentErrorBoundary
- `src/components/navigation/navigationConfig.ts` - navigationConfig
- `src/components/auth/LogoutButton.tsx` - LogoutButton
- `src/components/navigation/Navbar/NavbarCTA.tsx` - NavbarCTA
- `src/components/navigation/Navbar/NavbarItem.tsx` - NavbarItem
- `src/components/navigation/Navbar/NavbarNav.tsx` - NavbarNav
- `src/components/navigation/Navbar/NavbarBrand.tsx` - NavbarBrand
- `src/components/navigation/useNavigation.tsx` - NavigationProvider, useNavigation
- `src/components/navigation/UserMenu/UserAvatar.tsx` - UserAvatar
- `src/components/navigation/UserMenu/UserMenuItem.tsx` - UserMenuItem
- `src/components/navigation/UserMenu/UserMenu.tsx` - UserMenu
- `src/components/navigation/utils.ts` - cn
- `src/components/navigation/MobileNav/MobileNavOverlay.tsx` - MobileNavOverlay
- `src/components/navigation/MobileNav/MobileNav.tsx` - MobileNav
- `src/components/SideBar.tsx` - Sidebar
- `src/components/navigation/MobileNav/MobileNavItem.tsx` - MobileNavItem
- `src/components/ui/QuirkyButton.tsx` - QuirkyButton, ZenQuirkyButton
- `src/components/navigation/MobileNav/HamburgerButton.tsx` - HamburgerButton
- `src/components/ui/CustomButton.tsx` - ReusableButton, PrimaryButton, SecondaryButton, TertiaryButton, LinkButton
- `src/components/tokens.ts` - TOKENS, dashboardUrl
- `src/components/navigation/Footer/Footer.tsx` - Footer
- `src/components/ui/modal.tsx` - Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useModal
- `src/app/auth/login/SignInWithGoogle.tsx` - SignInWithGoogle
- `src/components/tasks/TodoApp.tsx` - TaskForm
- `src/app/ConvexClientProvider.tsx` - ConvexClientProvider

## Import/Export Analysis

### Dependency Graph
- **Convex Integration**: 104 import statements from convex/_generated/api across components
- **UI Library**: Heavy use of lucide-react icons (Phone, Clock, CheckCircle2, etc.)
- **Shared Utilities**: lib/utils.ts `cn` function imported in 15+ components
- **Token System**: @/components/tokens imported in 8 components
- **Navigation**: Complex inter-dependencies in navigation/ folder with index.ts files

### Circular Dependencies
- Potential circular import in navigation components (NavbarItem imports navigationConfig which may import NavbarItem)
- SideBar.tsx imports from navigation/ which may create cycles

## Component Categories

### UI Primitives (src/components/ui/)
- alert.tsx, badge.tsx, button.tsx, card.tsx, checkbox.tsx, CustomButton.tsx, input.tsx, modal.tsx, QuirkyButton.tsx, separator.tsx, tooltip.tsx

### Domain-Specific Components
- **Calendar**: WeekSectionComponent.tsx (544 lines), CalendarEventList.tsx
- **Calls**: CallButton.tsx, ClarityCallsSettingsCard.tsx (314 lines)
- **Tasks**: TodoApp.tsx, TaskForm.tsx
- **Settings**: SettingCard.tsx, ClarityCallsSettingsCard.tsx

### Layout Components
- **Navigation**: Complex navigation system with sub-folders (Navbar/, MobileNav/, UserMenu/, Footer/)
- **Dashboard**: NextCallCard.tsx, PageHeader.tsx, MobileMenu.tsx, SiderBar.tsx (395 lines)
- **App Layout**: SideBar.tsx with AppLayout export

### Page-Level Components
- **Landing**: Hero.tsx, Features.tsx, Problem.tsx, etc. (12 components)
- **Onboarding**: OnboardingForm.tsx
- **Admin**: AdminNextCallCard.tsx

## Pain Points

### Components >100 Lines
1. `src/components/calendar/WeekSectionComponent.tsx` - 544 lines (multiple responsibilities: data loading, rendering, state management)
2. `src/components/SideBar.tsx` - 395 lines (layout + sidebar logic mixed)
3. `src/components/settings/ClarityCallsSettingsCard.tsx` - 314 lines (settings UI + business logic)

### Multiple Responsibilities
- WeekSectionComponent: Calendar data fetching + UI rendering + multiple card types
- SideBar: Mobile/desktop responsive logic + navigation + layout management
- ClarityCallsSettingsCard: Form handling + time conversion + UI states

### Inconsistent Import Patterns
- Some use relative paths (../../../convex), others use @/ aliases
- Mixed default and named exports without clear convention
- Some components import entire libraries, others import specific functions

### Missing Index.ts Files
- `src/components/ui/` - 11 files, no index.ts (would simplify imports)
- `src/components/landing/` - 12 files, no index.ts
- `src/components/settings/` - 2 files, no index.ts
- `src/components/dashboard/` - 4 files, no index.ts

### Overly Nested Folder Structure
- `src/components/navigation/` has 5 sub-folders, each with multiple files
- `src/components/dashboard/navigation/` duplicates navigation logic

## Quick Wins

1. **Extract LoadingCard component** - Used in multiple places (WeekSectionComponent, SideBar)
2. **Create ui/index.ts** - Export all UI primitives for cleaner imports
3. **Extract time formatting utilities** - Duplicated in multiple components
4. **Consolidate navigation components** - Reduce sub-folder complexity
5. **Split WeekSectionComponent** - Separate data logic from UI rendering

## Duplicate Patterns

### Time Formatting
- `formatTimeDisplay` in ClarityCallsSettingsCard.tsx
- `formatShortDate` in WeekSectionComponent.tsx
- `getRelativeTime` in WeekSectionComponent.tsx

### Loading States
- Similar loading UI patterns in multiple components
- LoadingCard component could be extracted and reused

### Error Handling
- Similar error state patterns across settings components
- Could extract ErrorDisplay component

### Button Variants
- Multiple button implementations (CustomButton, QuirkyButton, regular button)
- Inconsistent styling and behavior