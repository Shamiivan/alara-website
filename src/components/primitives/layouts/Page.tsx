import React from 'react';

interface PageProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
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
  maxWidth = 'lg',
  className = ''
}: PageProps) {
  return (
    <div className={`content-wrapper ${maxWidthClasses[maxWidth]} ${className}`}>
      {(title || subtitle) && (
        <div className="page-header">
          <div>
            {title && <h1 className="page-title">{title}</h1>}
            {subtitle && <p className="page-description">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="spacing-content">
        {children}
      </div>
    </div>
  );
}