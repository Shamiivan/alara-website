# Navigation Components

A comprehensive, accessible, and responsive navigation system for the Alara website.

## Features

- **Responsive Design**: Adapts to desktop, tablet, and mobile viewports
- **Authentication-Aware**: Shows different navigation items based on user state
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Animations**: Smooth transitions for mobile menu and dropdowns
- **TypeScript**: Fully typed components and interfaces

## Usage

### Basic Usage

```tsx
import { Navbar, NavigationProvider } from '@/components/navigation';

export default function Layout({ children }) {
  return (
    <NavigationProvider>
      <Navbar />
      <main>{children}</main>
    </NavigationProvider>
  );
}
```

### With Custom Configuration

```tsx
import { Navbar, NavigationProvider, navigationConfig } from '@/components/navigation';

// Customize navigation items
const customNavConfig = {
  ...navigationConfig,
  mainNav: [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'about', label: 'About', href: '/about' },
    // ...more items
  ]
};

export default function Layout({ children }) {
  return (
    <NavigationProvider>
      <Navbar 
        variant="transparent"
        hideOnScroll={true}
        showShadow={true}
      />
      <main>{children}</main>
    </NavigationProvider>
  );
}
```

## Components

### Navbar

The main navigation component that displays the navigation bar at the top of the page.

```tsx
<Navbar
  user={user}                      // User object (optional)
  variant="default"                // 'default' | 'transparent' | 'dark'
  fixed={true}                     // Whether the navbar is fixed to the top
  hideOnScroll={false}             // Whether to hide the navbar on scroll
  showShadow={true}                // Whether to show a shadow when scrolled
  logo={<CustomLogo />}            // Custom logo component (optional)
  className="custom-navbar-class"  // Additional CSS classes
/>
```

### NavigationProvider

Context provider for navigation state. Must wrap the Navbar component.

```tsx
<NavigationProvider>
  {/* Your app content */}
</NavigationProvider>
```

### MobileNav

Mobile navigation drawer that slides in from the side. This is automatically included in the Navbar component.

```tsx
<MobileNav
  isOpen={isOpen}                  // Whether the mobile nav is open
  user={user}                      // User object (optional)
  items={navigationItems}          // Navigation items to display
  position="left"                  // 'left' | 'right'
  className="custom-mobile-nav"    // Additional CSS classes
/>
```

### UserMenu

User dropdown menu that displays when a user is authenticated. This is automatically included in the Navbar component.

```tsx
<UserMenu
  user={user}                      // User object
  className="custom-user-menu"     // Additional CSS classes
/>
```

## Navigation Configuration

The navigation configuration is defined in `navigationConfig.ts`. You can customize the navigation items by importing and modifying this configuration.

```tsx
import { navigationConfig } from '@/components/navigation';

// Customize navigation items
const customNavConfig = {
  ...navigationConfig,
  mainNav: [
    // Your custom navigation items
  ]
};
```

## Accessibility Features

- Skip navigation link for keyboard users
- ARIA attributes for screen readers
- Focus trapping in mobile menu
- Keyboard navigation support
- High contrast mode support
- Touch-friendly targets for mobile

## Browser Support

- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Android Chrome)
- IE11 not supported