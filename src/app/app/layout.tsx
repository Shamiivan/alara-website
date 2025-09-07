"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import Sidebar from "@/components/dashboard/navigation/SiderBar";
import MobileMenuButton from "@/components/dashboard/navigation/MobileMenu";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track if sidebar was manually opened
  const [manuallyOpened, setManuallyOpened] = useState(false);

  // Handle responsive behavior and setup
  useEffect(() => {
    setIsMounted(true);

    // Check if mobile and set initial sidebar state
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Set initial sidebar state based on screen size
      if (!mobile && !sidebarOpen) {
        // On desktop, open sidebar by default
        setSidebarOpen(true);
      } else if (mobile && sidebarOpen && !manuallyOpened) {
        // On mobile, close sidebar when resizing, but only if not manually opened
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Handle escape key
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
  }, [sidebarOpen, manuallyOpened]); // Added manuallyOpened to dependency array

  // Prevent body scroll when mobile sidebar is open
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

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Layout container styles
  const layoutStyles: React.CSSProperties = {
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
  };

  // Main content styles - adjust based on sidebar state and screen size
  const mainStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    marginLeft: !isMobile && sidebarOpen ? '320px' : '0',
    transition: 'margin-left 0.3s ease',
  };

  // Content wrapper styles
  const contentWrapperStyles: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: isMobile ? '80px 16px 24px 16px' : '32px 24px',
  };

  return (
    <div style={layoutStyles}>
      {/* Mobile menu button */}
      <MobileMenuButton
        onClick={() => {
          setManuallyOpened(true); // Mark as manually opened
          setSidebarOpen(true);
        }}
        isOpen={sidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => {
          setManuallyOpened(false); // Reset when manually closed
          setSidebarOpen(false);
        }}
      />

      {/* Main content area */}
      <main
        id="main-content"
        style={mainStyles}
      >
        <div style={contentWrapperStyles}>
          {children}
        </div>
      </main>
    </div>
  );
}