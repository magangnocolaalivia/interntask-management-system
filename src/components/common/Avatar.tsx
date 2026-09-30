import React, { useState } from 'react';
import { User } from '../../types';

interface AvatarProps {
  user?: User | { name: string; avatar?: string; profile_photo_path?: string | null } | null;
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  user,
  src,
  alt,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Determine photo source: prop src, or user.profile_photo_path, or user.avatar
  const photoSrc = src || user?.profile_photo_path || user?.avatar;
  const displayName = alt || user?.name || 'User';

  // Get initials (up to 2 letters)
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const initials = getInitials(displayName);

  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-xs font-bold',
    lg: 'w-12 h-12 text-sm font-bold',
    xl: 'w-16 h-16 text-base font-bold',
    '2xl': 'w-24 h-24 text-2xl font-bold',
  };

  // If valid image and not errored
  if (photoSrc && !imageError) {
    return (
      <img
        src={photoSrc}
        alt={displayName}
        onError={() => setImageError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 shadow-2xs shrink-0 ${className}`}
      />
    );
  }

  // Fallback: Initial Avatar
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold tracking-tight select-none shadow-2xs shrink-0 ${className}`}
      title={displayName}
    >
      <span>{initials}</span>
    </div>
  );
};
