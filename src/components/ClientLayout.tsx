"use client";

import { usePathname } from "next/navigation";
import { NavigationProvider } from "@/components/navigation/useNavigation";
import { Navbar, Footer } from "@/components/navigation";
import HydrationDebugger from "@/components/HydrationDebugger";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't show navbar/footer for app routes (authenticated pages)
  const isAppRoute = pathname?.startsWith('/app');

  return (
    <NavigationProvider>
      {/* Add HydrationDebugger to catch hydration errors */}
      <HydrationDebugger />
      {!isAppRoute && <Navbar />}
      <main id="main-content" className="test-global-css">
        {children}
      </main>
      {!isAppRoute && <Footer />}
    </NavigationProvider>
  );
}