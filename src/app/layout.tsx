import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { NavigationProvider } from "@/components/navigation/useNavigation";
import { Navbar, Footer } from "@/components/navigation";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased test-global-css`}
      >
        <ConvexAuthNextjsServerProvider>
          <ConvexClientProvider>
            <NavigationProvider>
              {/* Add HydrationDebugger to catch hydration errors */}
              <HydrationDebugger />
              <Navbar />
              <main id="main-content" className="test-global-css">
                {children}
              </main>
              <Footer />
            </NavigationProvider>
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
