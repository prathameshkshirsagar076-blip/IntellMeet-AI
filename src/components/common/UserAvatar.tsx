import React, { useState } from 'react';

export interface UserAvatarProps {
  avatar?: string | null;
  name?: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name,
  size,
  className = '',
  style = {},
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName?: string): string => {
    if (!fullName || !fullName.trim()) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isImageUrl = Boolean(
    avatar &&
      (avatar.startsWith('http://') ||
        avatar.startsWith('https://') ||
        avatar.startsWith('data:') ||
        avatar.startsWith('/'))
  );

  const combinedStyle: React.CSSProperties = {
    ...(size ? { width: size, height: size } : {}),
    ...style,
  };

  if (isImageUrl && !imageError) {
    return (
      <img
        src={avatar!}
        alt={name || 'User avatar'}
        className={`${className} im-avatar-img`.trim()}
        style={{
          ...combinedStyle,
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'block',
        }}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={className} style={combinedStyle}>
      {getInitials(name)}
    </div>
  );
};

export default UserAvatar;
