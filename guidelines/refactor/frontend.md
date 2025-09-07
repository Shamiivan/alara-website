# Frontend Refactor Analysis

## Component Usage Patterns

### All React Components Found

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