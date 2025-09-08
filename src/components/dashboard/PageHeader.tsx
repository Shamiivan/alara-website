"use client";

import React, { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({ title, description, icon, children }: PageHeaderProps) {
  const headerStyles: React.CSSProperties = {
    marginBottom: '32px',
    paddingBottom: '4px',
  };

  const titleRowStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: description ? '8px' : '0',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: 'clamp(24px, 4vw, 32px)', // Responsive font size
    fontWeight: '700',
    color: '#0f172a',
    margin: '0',
    lineHeight: '1.2',
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '16px',
    color: '#64748b',
    margin: '0',
    lineHeight: '1.5',
  };

  const iconStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <header style={headerStyles}>
      <div style={titleRowStyles}>
        {icon && (
          <span style={iconStyles}>
            {icon}
          </span>
        )}
        <h1 style={titleStyles}>{title}</h1>
      </div>
      {description && (
        <p style={descriptionStyles}>{description}</p>
      )}
      {children}
    </header>
  );
}