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