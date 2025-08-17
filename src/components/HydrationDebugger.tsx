"use client";

import { useEffect, useState } from 'react';

export default function HydrationDebugger() {
  const [isClient, setIsClient] = useState(false);

  // This will only run on the client
  useEffect(() => {
    setIsClient(true);

    // Add a global handler for React hydration errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this is a hydration error
      const errorString = args.join(' ');
      if (errorString.includes('Hydration') || errorString.includes('hydrat')) {
        console.log('%c HYDRATION ERROR DETECTED', 'background: #ff0000; color: white; padding: 2px 4px; border-radius: 2px;');
        console.log('Error details:', ...args);

        // Try to extract component info from the error
        const matches = errorString.match(/in ([<\w]+)/);
        if (matches && matches[1]) {
          console.log('%c Component causing error:', 'background: #ff6600; color: white; padding: 2px 4px; border-radius: 2px;', matches[1]);
        }
      }

      // Call the original console.error
      originalConsoleError.apply(console, args);
    };

    return () => {
      // Restore original console.error on cleanup
      console.error = originalConsoleError;
    };
  }, []);

  // This won't be visible in the UI, it's just for debugging
  return null;
}