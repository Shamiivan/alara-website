"use client";

import Image from 'next/image';
import { cn } from '../utils';

interface UserAvatarProps {
  user: {
    name: string;
    avatar?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className
}) => {
  const { name, avatar } = user;

  // Get initials from name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  // If user has an avatar, display it
  if (avatar) {
    return (
      <div className={cn(
        'relative rounded-full overflow-hidden',
        sizeClasses[size],
        className
      )}>
        <Image
          src={avatar}
          alt={`${name}'s avatar`}
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Otherwise, display initials
  return (
    <div className={cn(
      'flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium',
      sizeClasses[size],
      className
    )}>
      {initials}
    </div>
  );
};

export default UserAvatar;