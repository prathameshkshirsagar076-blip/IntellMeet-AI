import React, { useState, useEffect } from 'react';

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

  // Reset error state whenever avatar URL changes
  useEffect(() => {
    setImageError(false);
  }, [avatar]);

  const getInitials = (fullName?: string): string => {
    if (!fullName || !fullName.trim()) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const cleanAvatar = typeof avatar === 'string' ? avatar.trim() : '';
  const isImageUrl = Boolean(
    cleanAvatar &&
      (cleanAvatar.startsWith('http://') ||
        cleanAvatar.startsWith('https://') ||
        cleanAvatar.startsWith('data:') ||
        cleanAvatar.startsWith('/'))
  );

  const isNumericSize = typeof size === 'number';
  const sizeValue = isNumericSize ? `${size}px` : size;
  const calculatedFontSize = isNumericSize
    ? `${Math.max(10, Math.round((size as number) * 0.38))}px`
    : undefined;

  const containerStyle: React.CSSProperties = {
    ...(sizeValue
      ? {
          width: sizeValue,
          height: sizeValue,
          minWidth: sizeValue,
          minHeight: sizeValue,
          maxWidth: sizeValue,
          maxHeight: sizeValue,
        }
      : {}),
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: calculatedFontSize,
    userSelect: 'none',
    ...style,
  };

  return (
    <div className={`im-user-avatar ${className}`.trim()} style={containerStyle}>
      {isImageUrl && !imageError ? (
        <img
          src={cleanAvatar}
          alt={name || 'User avatar'}
          className="im-avatar-img"
          style={{
            width: '100%',
            height: '100%',
            minWidth: '100%',
            minHeight: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        <span
          className="im-avatar-initials"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            fontSize: 'inherit',
            fontWeight: 'inherit',
            color: 'inherit',
          }}
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};

export default UserAvatar;
