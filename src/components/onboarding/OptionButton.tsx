import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface OptionButtonProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick: () => void;
  icon?: string;
  className?: string;
  disabled?: boolean;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  children,
  selected = false,
  onClick,
  icon,
  className,
  disabled = false
}) => {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      size="lg"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full justify-start text-left p-6 h-auto transition-all duration-200',
        'hover:shadow-soft hover:scale-[1.02]',
        selected && 'bg-gradient-primary shadow-glow border-primary-glow',
        !selected && 'hover:bg-muted/50 hover:border-primary/30',
        className
      )}
    >
      <div className="flex items-center gap-4 w-full">
        {icon && (
          <span className="text-2xl flex-shrink-0">{icon}</span>
        )}
        <span className="flex-1 text-base font-medium leading-relaxed">
          {children}
        </span>
        {selected && (
          <span className="text-lg">✓</span>
        )}
      </div>
    </Button>
  );
};