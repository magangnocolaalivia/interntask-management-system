import React, { useState } from 'react';
import { User } from '../../types';

interface UserAvatarProps {
  user?: Partial<User> | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showRoleBadge?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  showRoleBadge = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Resolve photo source from avatar or profile_photo_path
  const photoSrc = user?.avatar || (user?.profile_photo_path ? (
    user.profile_photo_path.startsWith('http') || user.profile_photo_path.startsWith('data:') 
      ? user.profile_photo_path 
      : `/storage/${user.profile_photo_path}`
  ) : null);

  // Reset image error state whenever user or photo changes
  React.useEffect(() => {
    setImageError(false);
  }, [user?.id, photoSrc]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const roleColors = {
    director: 'bg-rose-50 text-rose-700 border-rose-200',
    mentor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    intern: 'bg-teal-50 text-teal-700 border-teal-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const roleBadgeDot = {
    director: 'bg-rose-500',
    mentor: 'bg-indigo-500',
    intern: 'bg-teal-500',
    default: 'bg-slate-400',
  };

  const roleKey = (user?.role as keyof typeof roleColors) || 'default';
  const roleColorClass = roleColors[roleKey] || roleColors.default;

  const hasPhoto = Boolean(photoSrc) && !imageError;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {hasPhoto ? (
        <img
          data-user-avatar
          src={photoSrc!}
          alt={user?.name || 'User Avatar'}
          onError={() => setImageError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 shadow-2xs bg-white shrink-0`}
        />
      ) : (
        <div
          data-user-avatar-fallback
          className={`${sizeClasses[size]} rounded-full border flex items-center justify-center font-bold tracking-tight select-none shadow-2xs shrink-0 ${roleColorClass}`}
          title={user?.name || 'Pengguna'}
        >
          {getInitials(user?.name)}
        </div>
      )}

      {showRoleBadge && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${roleBadgeDot[roleKey] || roleBadgeDot.default}`}
          title={`Role: ${user?.role || 'User'}`}
        />
      )}
    </div>
  );
};
