"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import NextCallCard from "@/components/dashboard/NextCallCard";
import CalendarComponent from "@/components/calendar/CalendarComponent";
import { Sparkles, Star, Zap, Check, Clock, Calendar, Smile } from "lucide-react";
import Rolling7DayStrip from "@/components/calendar/WeekSectionComponent"
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = "Hello";

    if (hour < 12) newGreeting = "Good morning";
    else if (hour < 17) newGreeting = "Good afternoon";
    else newGreeting = "Good evening";

    setGreeting(newGreeting);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    setMounted(true);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { icon: <Check size={18} />, text: "Toggle the sidebar using the menu button", color: "#10b981" },
    { icon: <Zap size={18} />, text: "Navigate easily between Dashboard, Calls, and Tasks", color: "#3b82f6" },
    { icon: <Clock size={18} />, text: "Sidebar slides smoothly on mobile and desktop", color: "#8b5cf6" },
    { icon: <Calendar size={18} />, text: "Responsive layout adapts to any screen size", color: "#f59e0b" },
    { icon: <Smile size={18} />, text: "Touch-friendly with 44px minimum tap targets", color: "#ec4899" }
  ];

  // Container styles
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(8px)',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
  };

  // Welcome card styles
  const welcomeCardStyles: React.CSSProperties = {
    backgroundColor: 'white',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  };

  // Content grid styles
  const contentGridStyles: React.CSSProperties = {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: '1fr',
  };

  // Two column grid for larger screens
  const twoColumnGridStyles: React.CSSProperties = {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
  };

  // Feature list styles
  const featureListStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    margin: '16px 0',
  };

  // Feature item styles
  const getFeatureItemStyles = (index: number): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
    transition: `opacity 0.3s ease ${index * 100}ms, transform 0.3s ease ${index * 100}ms`,
  });

  // Card styles for next call and calendar
  const cardStyles: React.CSSProperties = {
    backgroundColor: 'white',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    borderRadius: '16px',
    padding: '1px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  };

  // Quick actions grid styles
  const quickActionsGridStyles: React.CSSProperties = {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    marginTop: '16px',
  };

  // Quick action item styles
  const quickActionItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'rgba(226, 232, 240, 0.3)',
  };

  return (
    <div style={containerStyles}>
      <PageHeader
        title="Dashboard"
        description={`${greeting}! Here's your productivity overview`}
        icon={<Sparkles size={24} color="#fbbf24" style={{ animation: 'pulse 2s infinite' }} />}
      />

      <div style={contentGridStyles}>
        {/* Welcome Card */}
        <div style={welcomeCardStyles}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Star size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0 0 8px 0'
              }}>
                Welcome to your mobile-first layout
              </h2>
              <p style={{
                color: '#64748b',
                margin: '0 0 16px 0',
                lineHeight: '1.5'
              }}>
                This layout prioritizes mobile usability while maintaining desktop functionality.
              </p>

              <ul style={featureListStyles}>
                {features.map((item, index) => (
                  <li key={index} style={getFeatureItemStyles(index)}>
                    <span style={{
                      marginTop: '2px',
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      color: '#64748b',
                      lineHeight: '1.4'
                    }}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Rolling7DayStrip />
        {/* Content Grid - Two Column on Desktop */}
        <div style={twoColumnGridStyles}>
          {/* Next Call Section */}
          <div style={cardStyles}>
            <div style={{ padding: '20px 20px 4px 20px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0 0 8px 0'
              }}>
                Next Call
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: '0 0 16px 0'
              }}>
                Manage your upcoming conversations
              </p>
            </div>
            <NextCallCard
              onSave={() => { }}
              onCancel={() => { }}
              compact={true}
            />
          </div>

          {/* Calendar Section */}
          <div style={cardStyles}>
            <div style={{ padding: '20px 20px 4px 20px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0 0 8px 0'
              }}>
                Calendar
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: '0 0 16px 0'
              }}>
                Your schedule at a glance
              </p>
            </div>
            {/* <CalendarComponent /> */}
            <Rolling7DayStrip />
          </div>
        </div>

        {/* Quick Actions Card */}
        <div style={welcomeCardStyles}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 16px 0'
          }}>
            Layout Features
          </h3>

          <div style={quickActionsGridStyles}>
            <div style={quickActionItemStyles}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={16} color="#2563eb" />
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0f172a',
                  margin: '0 0 2px 0'
                }}>
                  Touch Optimized
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  margin: '0'
                }}>
                  44px minimum targets
                </p>
              </div>
            </div>

            <div style={quickActionItemStyles}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Check size={16} color="#16a34a" />
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0f172a',
                  margin: '0 0 2px 0'
                }}>
                  Responsive Grid
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  margin: '0'
                }}>
                  Adapts to all screens
                </p>
              </div>
            </div>

            <div style={quickActionItemStyles}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#f3e8ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Smile size={16} color="#9333ea" />
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0f172a',
                  margin: '0 0 2px 0'
                }}>
                  Smooth Animations
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  margin: '0'
                }}>
                  Reduced motion support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}