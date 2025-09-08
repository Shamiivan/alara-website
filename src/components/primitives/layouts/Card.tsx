import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const cardVariants = {
  default: 'card-base',
  elevated: 'card-elevated'
};

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick
}: CardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`
        ${cardVariants[variant]}
        ${paddingClasses[padding]}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `.trim()}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}